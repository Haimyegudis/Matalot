import { supabase } from './supabase'

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export async function enablePush(profileId: string): Promise<boolean> {
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!publicKey || !('serviceWorker' in navigator) || !('PushManager' in window)) return false

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(publicKey) as BufferSource,
  })
  const json = sub.toJSON()
  const { data: fam } = await supabase.from('families').select('id').maybeSingle()
  if (!fam) return false
  await supabase.from('push_subscriptions').upsert(
    {
      family_id: fam.id,
      profile_id: profileId,
      endpoint: sub.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
      device_label: navigator.userAgent.slice(0, 80),
    },
    { onConflict: 'endpoint' },
  )
  return true
}
