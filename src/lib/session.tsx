import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { Family, Profile } from './db-types'

const PROFILE_KEY = 'matalot.profileId'

interface SessionState {
  loading: boolean
  authed: boolean
  family: Family | null
  profiles: Profile[]
  currentProfile: Profile | null
  setCurrentProfile: (id: string | null) => void
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionState | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [family, setFamily] = useState<Family | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profileId, setProfileId] = useState<string | null>(
    localStorage.getItem(PROFILE_KEY),
  )

  async function loadFamily() {
    const { data: fam } = await supabase.from('families').select('*').maybeSingle()
    setFamily(fam ?? null)
    if (fam) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('sort')
      setProfiles(profs ?? [])
    } else {
      setProfiles([])
    }
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession()
    const has = Boolean(data.session)
    setAuthed(has)
    if (has) await loadFamily()
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session))
      if (session) loadFamily()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const setCurrentProfile = (id: string | null) => {
    if (id) localStorage.setItem(PROFILE_KEY, id)
    else localStorage.removeItem(PROFILE_KEY)
    setProfileId(id)
  }

  const currentProfile = profiles.find((p) => p.id === profileId) ?? null

  return (
    <SessionContext.Provider
      value={{ loading, authed, family, profiles, currentProfile, setCurrentProfile, refresh }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession outside provider')
  return ctx
}
