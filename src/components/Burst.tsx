/* Star burst played once when a chore is completed. */
const COLORS = ['#ff6b6b', '#2ec4b6', '#ffc53d', '#9b5de5', '#4cc9f0']

export function Burst() {
  const parts = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2
    const dist = 46 + (i % 3) * 14
    return {
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist}px`,
      color: COLORS[i % COLORS.length],
      delay: `${(i % 4) * 30}ms`,
    }
  })
  return (
    <span style={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none', overflow: 'visible' }}>
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            insetInlineStart: '50%',
            width: 10,
            height: 10,
            borderRadius: i % 2 ? '50%' : 2,
            background: p.color,
            // @ts-expect-error css vars
            '--dx': p.dx,
            '--dy': p.dy,
            animation: `burst-fly 620ms ease-out ${p.delay} forwards`,
          }}
        />
      ))}
      <span
        style={{
          position: 'absolute',
          top: -6,
          insetInlineStart: '50%',
          transform: 'translateX(50%)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          color: 'var(--good)',
          animation: 'chip-rise 900ms ease-out forwards',
        }}
      >
        +1
      </span>
    </span>
  )
}
