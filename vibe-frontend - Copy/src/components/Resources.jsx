import { SectionLabel } from '@/components/ui'

const RESOURCES = [
  {
    category: 'Fitness', color: 'var(--green)', items: [
      { title:'ExRx Exercise Library',       url:'https://exrx.net',                                         desc:'Database of exercises with form guides' },
      { title:'Bodyweight Fitness Wiki',      url:'https://reddit.com/r/bodyweightfitness/wiki',              desc:'Free structured bodyweight program' },
      { title:'StrengthLevel Calculator',     url:'https://strengthlevel.com',                               desc:'Compare your lifts to standards' },
    ],
  },
  {
    category: 'Nutrition', color: 'var(--amber)', items: [
      { title:'Examine.com',   url:'https://examine.com',      desc:'Evidence-based nutrition & supplement research' },
      { title:'Cronometer',    url:'https://cronometer.com',   desc:'Detailed micronutrient food tracking' },
    ],
  },
  {
    category: 'Mental wellness', color: 'var(--blue)', items: [
      { title:'Headspace',  url:'https://headspace.com', desc:'Guided meditation & mindfulness' },
      { title:'7 Cups',     url:'https://7cups.com',     desc:'Free emotional support & online therapy' },
    ],
  },
  {
    category: 'Sleep', color: 'var(--purple)', items: [
      { title:'Sleep Foundation', url:'https://sleepfoundation.org', desc:'Science-backed sleep guidance' },
    ],
  },
]

export default function Resources() {
  return (
    <div style={s.root}>
      <SectionLabel>Resources</SectionLabel>
      {RESOURCES.map(group => (
        <div key={group.category} style={s.group}>
          <p style={{ ...s.groupLabel, color: group.color }}>{group.category}</p>
          {group.items.map(item => (
            <a key={item.title} href={item.url} target="_blank" rel="noreferrer" style={s.link}>
              <p style={s.linkTitle}>{item.title}</p>
              <p style={s.linkDesc}>{item.desc}</p>
            </a>
          ))}
        </div>
      ))}
    </div>
  )
}

const s = {
  root: { display:'flex', flexDirection:'column', gap:18, height:'100%', overflowY:'auto', paddingBottom:8 },
  group: { display:'flex', flexDirection:'column', gap:5 },
  groupLabel: { fontSize:10, fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', fontFamily:'var(--font-display)' },
  link: {
    display:'block', padding:'8px 10px',
    background:'var(--bg-surface)', border:'1px solid var(--border-dim)',
    borderRadius:'var(--r-md)', transition:'border-color var(--t-fast)',
    cursor:'pointer',
  },
  linkTitle: { fontSize:12, fontWeight:500, color:'var(--text-primary)', marginBottom:2 },
  linkDesc: { fontSize:11, color:'var(--text-muted)', lineHeight:1.4 },
}