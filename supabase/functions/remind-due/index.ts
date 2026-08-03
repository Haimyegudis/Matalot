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
  return Response.json({ due: due?.length ?? 0, sent })
})
