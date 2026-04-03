import { useStore } from '@/store'
import CheckIn from '@/components/CheckIn'
import LogPanel from '@/components/LogPanel'
import Resources from '@/components/Resources'

const TABS = [
  { id:'checkin',   label:'Check-in', icon:'📋' },
  { id:'logs',      label:'Logs',     icon:'📊' },
  { id:'resources', label:'Links',    icon:'🔗' },
]

export default function Sidebar({ side = 'left' }) {
  const { sidebarTab, setSidebarTab } = useStore()

  // Left shows checkin + logs, right shows resources only
  const tabs = side === 'left' ? TABS.slice(0, 2) : TABS.slice(2)
  const activeTab = side === 'right' ? 'resources' : sidebarTab

  return (
    <aside style={{
      ...s.root,
      borderRight: side === 'left' ? '1px solid var(--border-dim)' : 'none',
      borderLeft:  side === 'right' ? '1px solid var(--border-dim)' : 'none',
    }}>
      {/* Tab bar */}
      <div style={s.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => side === 'left' && setSidebarTab(t.id)}
            style={{
              ...s.tab,
              ...(activeTab === t.id ? s.tabActive : {}),
            }}
          >
            <span style={s.tabIcon}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.body}>
        {activeTab === 'checkin'   && <CheckIn />}
        {activeTab === 'logs'      && <LogPanel />}
        {activeTab === 'resources' && <Resources />}
      </div>
    </aside>
  )
}

const s = {
  root: { display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg-base)' },
  tabs: { display:'flex', borderBottom:'1px solid var(--border-dim)', flexShrink:0 },
  tab: {
    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
    padding:'10px 6px', fontSize:11, fontWeight:500,
    color:'var(--text-muted)', background:'transparent', border:'none',
    borderBottom:'2px solid transparent', transition:'var(--t-fast)',
    fontFamily:'var(--font-display)',
  },
  tabActive: { color:'var(--green)', borderBottom:'2px solid var(--green)' },
  tabIcon: { fontSize:13 },
  body: { flex:1, overflow:'hidden', padding:'14px 12px' },
}