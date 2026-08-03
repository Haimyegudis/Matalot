import { useEffect, useMemo } from 'react'
import { playMagic } from '../lib/sound'

const COLORS = ['#f59e0b', '#ef4444', '#22d3ee', '#a3e635', '#8b5cf6', '#ec4899', '#fbbf24']

/** Full-screen "way to go" overlay: confetti rain + floating hearts. */
export function Celebration({ name, goal, onClose }: { name: string; goal: number; onClose: () => void }) {
  useEffect(() => {
    playMagic()
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [onClose])

  const confetti = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 2.2,
        duration: 2.6 + Math.random() * 2,
        size: 7 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        spin: Math.random() > 0.5 ? 1 : -1,
      })),
    [],
  )
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        left: 5 + Math.random() * 90,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2.5,
        size: 1 + Math.random() * 1.4,
      })),
    [],
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(18, 12, 38, .88)',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        animation: 'pop-in .3s ease',
      }}
    >
      {confetti.map((c, i) => (
        <span
          key={`c${i}`}
          style={{
            position: 'absolute',
            top: -20,
            insetInlineStart: `${c.left}%`,
            width: c.size,
            height: c.size * 0.45,
            background: c.color,
            borderRadius: 2,
            animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
            ['--spin' as string]: `${c.spin * 720}deg`,
          }}
        />
      ))}
      {hearts.map((h, i) => (
        <span
          key={`h${i}`}
          style={{
            position: 'absolute',
            bottom: -40,
            insetInlineStart: `${h.left}%`,
            fontSize: `${h.size}rem`,
            animation: `heart-float ${h.duration}s ease-in ${h.delay}s infinite`,
          }}
        >
          ❤️
        </span>
      ))}
      <div style={{ textAlign: 'center', display: 'grid', gap: 14, padding: 24, animation: 'pop-in .45s ease' }}>
        <div style={{ fontSize: '4rem', lineHeight: 1 }}>🏆</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#fff', lineHeight: 1.15 }}>
          כל הכבוד {name}!
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--sunny, #fbbf24)' }}>
          הגעת ל-{goal} נקודות! 🎉
        </div>
        <div style={{ color: 'rgba(255,255,255,.55)', fontSize: '0.85rem', fontWeight: 600 }}>לחיצה לסגירה</div>
      </div>
    </div>
  )
}
