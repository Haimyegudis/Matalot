// Cron-invoked every minute: pushes reminders for due, un-reminded tasks
// to the assigned kid's devices. Harmless if invoked externally: it only
// sends reminders for genuinely-due tasks, once (reminded_at guard).
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

webpush.setVapidDetails(
  'mailto:haim036688893@gmail.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

Deno.serve(async () => {
  const { data: due } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .is('reminded_at', null)
    .lte('remind_at', new Date().toISOString())
    .not('remind_at', 'is', null)
    .limit(50)

  let sent = 0
  for (const task of due ?? []) {
    // claim first so a concurrent run never double-sends
    const { data: claimed } = await supabaseAdmin
      .from('tasks')
      .update({ reminded_at: new Date().toISOString() })
      .eq('id', task.id)
      .is('reminded_at', null)
      .select()
    if (!claimed || claimed.length === 0) continue

    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('profile_id', task.child_id)

    const payload = JSON.stringify({
      title: '⏰ תזכורת ממטלות',
      body: task.title,
      url: '/',
    })
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
        sent++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }
  }
  // scheduled parent nudges (notification-only reminders)
  const { data: dueNudges } = await supabaseAdmin
    .from('nudges')
    .select('*')
    .is('sent_at', null)
    .lte('remind_at', new Date().toISOString())
    .limit(50)

  for (const nudge of dueNudges ?? []) {
    const { data: claimed } = await supabaseAdmin
      .from('nudges')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', nudge.id)
      .is('sent_at', null)
      .select()
    if (!claimed || claimed.length === 0) continue

    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('profile_id', nudge.child_id)

    const payload = JSON.stringify({
      title: nudge.sender_name ? `📣 ${nudge.sender_name}` : '📣 תזכורת',
      body: nudge.message,
      url: '/',
    })
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
        sent++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }
  }

  // due day-pick chore reminders ("today at HH:MM" chores)
  const { data: duePicks } = await supabaseAdmin
    .from('day_picks')
    .select('*, chores(title)')
    .is('reminded_at', null)
    .lte('remind_at', new Date().toISOString())
    .not('remind_at', 'is', null)
    .limit(50)

  for (const pick of duePicks ?? []) {
    const { data: claimed } = await supabaseAdmin
      .from('day_picks')
      .update({ reminded_at: new Date().toISOString() })
      .eq('id', pick.id)
      .is('reminded_at', null)
      .select()
    if (!claimed || claimed.length === 0) continue

    let recipients: string[]
    if (pick.child_id) recipients = [pick.child_id]
    else {
      const { data: kidRows } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('family_id', pick.family_id)
        .eq('role', 'child')
      recipients = (kidRows ?? []).map((k) => k.id)
    }
    // skip kids who already did it today
    const { data: doneRows } = await supabaseAdmin
      .from('completions')
      .select('profile_id')
      .eq('chore_id', pick.chore_id)
      .eq('day', pick.day)
      .is('revoked_by', null)
    const done = new Set((doneRows ?? []).map((d) => d.profile_id))
    recipients = recipients.filter((r) => !done.has(r))

    const payload = JSON.stringify({
      title: '⏰ תזכורת ממטלות',
      body: (pick as { chores?: { title?: string } }).chores?.title ?? 'מטלה',
      url: '/',
    })
    for (const rid of recipients) {
      const { data: subs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('profile_id', rid)
      for (const sub of subs ?? []) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
          sent++
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode
          if (status === 404 || status === 410) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
          }
        }
      }
    }
  }

  return Response.json({ due: due?.length ?? 0, nudges: dueNudges?.length ?? 0, picks: duePicks?.length ?? 0, sent })
})
