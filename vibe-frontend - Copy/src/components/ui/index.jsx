import clsx from 'clsx'

// ── Button ────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'default', size = 'md', disabled, onClick, style, className }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 'var(--r-md)', fontFamily: 'var(--font-display)',
    fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1, transition: 'var(--t-base)',
    border: 'none', outline: 'none',
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 15 },
  }
  const variants = {
    default: { background: 'var(--bg-overlay)', border: '1px solid var(--border-soft)', color: 'var(--text-secondary)' },
    primary: { background: 'var(--green)', color: '#071209', border: '1px solid transparent' },
    ghost:   { background: 'transparent', border: '1px solid var(--border-dim)', color: 'var(--text-muted)' },
    accent:  { background: 'var(--green-dim)', border: '1px solid rgba(144,212,160,0.25)', color: 'var(--green)' },
    danger:  { background: 'var(--red-dim)', border: '1px solid rgba(232,128,128,0.25)', color: 'var(--red)' },
  }
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ value, onChange, onKeyDown, placeholder, type = 'text', style, autoFocus }) {
  return (
    <input
      type={type} value={value} onChange={onChange} onKeyDown={onKeyDown}
      placeholder={placeholder} autoFocus={autoFocus}
      style={{
        width: '100%', background: 'var(--bg-overlay)',
        border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)',
        padding: '10px 14px', color: 'var(--text-primary)',
        fontSize: 14, outline: 'none', transition: 'border-color var(--t-fast)',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(144,212,160,0.35)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
    />
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────
export function Textarea({ value, onChange, onKeyDown, placeholder, rows = 1, ref: _ref, style }) {
  return (
    <textarea
      ref={_ref} value={value} onChange={onChange} onKeyDown={onKeyDown}
      placeholder={placeholder} rows={rows}
      style={{
        width: '100%', background: 'var(--bg-overlay)',
        border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)',
        padding: '10px 14px', color: 'var(--text-primary)',
        fontSize: 14, resize: 'none', outline: 'none',
        lineHeight: 1.55, transition: 'border-color var(--t-fast)',
        minHeight: 44, maxHeight: 140,
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(144,212,160,0.35)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ value, onChange, children, style }) {
  return (
    <select
      value={value} onChange={onChange}
      style={{
        width: '100%', background: 'var(--bg-overlay)',
        border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)',
        padding: '9px 12px', color: 'var(--text-primary)',
        fontSize: 13, outline: 'none',
        ...style,
      }}
    >
      {children}
    </select>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, style, padding = 14 }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-dim)',
      borderRadius: 'var(--r-lg)', padding,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'green' }) {
  const map = {
    green:  { bg: 'var(--green-dim)',  border: 'rgba(144,212,160,0.2)',  text: 'var(--green)' },
    blue:   { bg: 'var(--blue-dim)',   border: 'rgba(126,200,232,0.2)',  text: 'var(--blue)' },
    amber:  { bg: 'var(--amber-dim)',  border: 'rgba(232,196,106,0.2)',  text: 'var(--amber)' },
    red:    { bg: 'var(--red-dim)',    border: 'rgba(232,128,128,0.2)',  text: 'var(--red)' },
    purple: { bg: 'var(--purple-dim)', border: 'rgba(184,160,232,0.2)', text: 'var(--purple)' },
    muted:  { bg: 'var(--bg-overlay)', border: 'var(--border-dim)',      text: 'var(--text-muted)' },
  }
  const c = map[color] || map.green
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, borderRadius: 'var(--r-full)',
      padding: '2px 9px', fontSize: 11, fontWeight: 500,
    }}>
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = 'var(--green)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid rgba(255,255,255,0.08)`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Divider ───────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <div style={{ height: 1, background: 'var(--border-dim)', ...style }} />
}

// ── SectionLabel ─────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '1px',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      fontFamily: 'var(--font-display)',
    }}>
      {children}
    </p>
  )
}