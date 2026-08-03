// Sends a completion notification to all PARENT devices of the caller's family.
// Invoked (fire-and-forget) from the app after a kid completes a chore/task.
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

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('Authorization') ?? ''
    const jwt = auth.replace('Bearer ', '')
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(jwt)
    if (userErr || !userData.user) return new Response('unauthorized', { status: 401 })

    const { kind, profileId, profileIds, title, senderName, timeLabel } = await req.json()

    const { data: family } = await supabaseAdmin
      .from('families')
      .select('id')
      .eq('owner_uid', userData.user.id)
      .single()
    if (!family) return new Response('no family', { status: 404 })

    // parent assigned a chore/task — instant heads-up to the kid(s)
    if (kind === 'assigned') {
      const ids: string[] = Array.isArray(profileIds) ? profileIds : []
      if (ids.length === 0) return Response.json({ sent: 0 })
      const { data: targets } = await supabaseAdmin
        .from('profiles')
        .select('id, family_id')
        .in('id', ids)
      if (!targets || targets.some((t) => t.family_id !== family.id)) {
        return new Response('bad profile', { status: 403 })
      }

      const { data: subs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .in('profile_id', ids)

      const payload = JSON.stringify({
        title: '📌 מטלה חדשה',
        body: `${title || 'מטלה'}${timeLabel ? ` · ${timeLabel}` : ''}`,
        url: '/',
      })
      let sent = 0
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
      return Response.json({ sent })
    }

    // parent-initiated instant nudge to a specific kid's devices
    if (kind === 'nudge') {
      const { data: target } = await supabaseAdmin
        .from('profiles')
        .select('family_id')
        .eq('id', profileId)
        .single()
      if (!target || target.family_id !== family.id) return new Response('bad profile', { status: 403 })

      const { data: subs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('profile_id', profileId)

      const payload = JSON.stringify({
        title: senderName ? `📣 ${senderName}` : '📣 תזכורת',
        body: title || 'יש לך מטלות פתוחות!',
        url: '/',
      })
      let sent = 0
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
      return Response.json({ sent })
    }

    const { data: actor } = await supabaseAdmin
      .from('profiles')
      .select('name, family_id, gender')
      .eq('id', profileId)
      .single()
    if (!actor || actor.family_id !== family.id) return new Response('bad profile', { status: 403 })

    const { data: parents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('family_id', family.id)
      .eq('role', 'parent')
    const parentIds = (parents ?? []).map((p) => p.id)

    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('profile_id', parentIds)

    const verb = actor.gender === 'female' ? 'ביצעה' : 'ביצע'
    const payload = JSON.stringify({
      title: 'מטלות 🎉',
      body: `${actor.name} ${verb}: ${title}`,
      url: '/parent',
    })

    let sent = 0
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
        )
        sent++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }
    return Response.json({ sent })
  } catch (e) {
    return new Response(String(e), { status: 500 })
  }
})
