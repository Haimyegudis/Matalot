import { Routes, Route, useLocation, Link } from 'react-router-dom'
import './styles/base.css'
import { SessionProvider, useSession } from './lib/session'
import { useFamilyData } from './lib/store'
import { SetupScreen } from './screens/SetupScreen'
import { ProfilePicker } from './screens/ProfilePicker'
import { KidHome } from './screens/KidHome'
import { KidCalendar } from './screens/KidCalendar'
import { ProfileScreen } from './screens/ProfileScreen'
import { PinGate } from './screens/parent/PinGate'
import { ParentScreen } from './screens/parent/ParentScreen'
import { BottomNav } from './components/BottomNav'

function Splash() {
  return (
    <div className="screen" style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ fontSize: '3rem', animation: 'wiggle 1.2s ease-in-out infinite' }}>🏠</div>
    </div>
  )
}

function AppRoutes() {
  const { loading, authed, family, currentProfile } = useSession()
  const data = useFamilyData(family?.id ?? null)
  const location = useLocation()

  if (loading) return <Splash />
  if (!authed || !family) return <SetupScreen />
  if (!currentProfile) return <ProfilePicker />

  const inParent = location.pathname.startsWith('/parent')

  return (
    <>
      <Routes>
        <Route path="/" element={<KidHome data={data} />} />
        <Route path="/yesterday" element={<KidHome data={data} yesterday />} />
        <Route path="/calendar" element={<KidCalendar data={data} />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/task/:id" element={<KidHome data={data} />} />
        <Route
          path="/parent/*"
          element={
            <PinGate>
              <ParentScreen data={data} />
            </PinGate>
          }
        />
      </Routes>
      {!inParent && (
        <>
          <BottomNav />
          <Link
            to="/parent"
            aria-label="מצב הורה"
            style={{
              position: 'fixed',
              bottom: 'calc(var(--nav-h) + 14px)',
              insetInlineEnd: 14,
              zIndex: 30,
              width: 40,
              height: 40,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--paper)',
              border: 'var(--border)',
              borderRadius: '50%',
              boxShadow: 'var(--pop)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              opacity: 0.75,
            }}
          >
            🔒
          </Link>
        </>
      )}
    </>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  )
}
