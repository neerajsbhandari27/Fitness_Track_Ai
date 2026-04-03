import { useStore } from '@/store'
import { Button } from '@/components/ui'

export default function Topbar() {
  const { userId, clearSession } = useStore()
  const displayName = userId.split('_').slice(0, -1).join(' ')

  return (
    <header style={s.root}>
      <div style={s.brand}>
        <span style={s.mark}>✦</span>
        <span style={s.logo}>vibe</span>
      </div>

      <div style={s.center}>
        <span style={s.pill}>AI Wellness Companion</span>
      </div>

      <div style={s.right}>
        {displayName && (
          <span style={s.user}>
            <span style={s.userDot} />
            {displayName}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={clearSession}>
          Sign out
        </Button>
      </div>
    </header>
  )
}

const s = {
  root: {
    height:52, flexShrink:0, display:'flex', alignItems:'center',
    justifyContent:'space-between', padding:'0 18px',
    borderBottom:'1px solid var(--border-dim)', background:'var(--bg-base)',
    zIndex:10,
  },
  brand: { display:'flex', alignItems:'center', gap:7 },
  mark: { fontSize:14, color:'var(--green)' },
  logo: { fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, letterSpacing:'-0.5px' },
  center: {},
  pill: {
    fontSize:11, color:'var(--text-muted)',
    background:'var(--bg-surface)', border:'1px solid var(--border-dim)',
    borderRadius:'var(--r-full)', padding:'3px 10px',
  },
  right: { display:'flex', alignItems:'center', gap:10 },
  user: { fontSize:12, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5, textTransform:'capitalize' },
  userDot: { width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite' },
}