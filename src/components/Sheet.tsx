import type { ReactNode } from 'react'

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(43,33,69,.45)', zIndex: 40, display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          margin: '0 auto',
          background: 'var(--bg)',
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          border: 'var(--border)',
          borderBottom: 'none',
          padding: '10px 18px calc(18px + env(safe-area-inset-bottom))',
          maxHeight: '82dvh',
          overflowY: 'auto',
          animation: 'pop-in .22s ease',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: 'var(--line)', margin: '4px auto 12px' }} />
        {children}
      </div>
    </div>
  )
}
