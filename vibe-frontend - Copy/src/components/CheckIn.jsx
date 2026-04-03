import { useState } from 'react'
import { submitCheckin } from '@/api/client'
import { useStore } from '@/store'
import { Button, Badge, SectionLabel } from '@/components/ui'
import toast from 'react-hot-toast'

const SLIDERS = [
  { key:'mood',        label:'Mood',        emoji:'😊', color:'var(--green)',  min:1, max:10, step:1 },
  { key:'energy',      label:'Energy',      emoji:'⚡', color:'var(--amber)',  min:1, max:10, step:1 },
  { key:'sleep_hours', label:'Sleep',       emoji:'😴', color:'var(--purple)', min:0, max:12, step:0.5, unit:'hrs' },
  { key:'stress',      label:'Stress',      emoji:'😰', color:'var(--red)',    min:1, max:10, step:1 },
]

const FLAG_COLOR = {
  low_mood: 'red', low_energy: 'amber', high_stress: 'red', sleep_deficit: 'purple',
}

export default function CheckIn() {
  const { userId, sessionId, setLastCheckin } = useStore()
  const [vals, setVals] = useState({ mood:6, energy:6, sleep_hours:7, stress:4 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async () => {
    if (!sessionId) return toast.error('No active session')
    setLoading(true)
    try {
      const data = await submitCheckin({ user_id:userId, session_id:sessionId, ...vals })
      setResult(data)
      setLastCheckin(data)
      toast.success('Check-in saved!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      <SectionLabel>Daily check-in</SectionLabel>

      <div style={s.sliders}>
        {SLIDERS.map(sl => (
          <div key={sl.key} style={s.sliderRow}>
            <div style={s.sliderHeader}>
              <span style={s.sliderLabel}>{sl.emoji} {sl.label}</span>
              <span style={{ ...s.sliderVal, color: sl.color }}>
                {vals[sl.key]}{sl.unit ? ` ${sl.unit}` : ''}
              </span>
            </div>
            <div style={s.trackWrap}>
              <div style={{
                ...s.trackFill,
                width: `${((vals[sl.key] - sl.min) / (sl.max - sl.min)) * 100}%`,
                background: sl.color,
              }} />
              <input
                type="range" min={sl.min} max={sl.max} step={sl.step}
                value={vals[sl.key]}
                onChange={e => setVals(v => ({ ...v, [sl.key]: Number(e.target.value) }))}
                style={{ ...s.range, accentColor: sl.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="accent" size="md"
        onClick={handleSubmit} disabled={loading}
        style={{ width:'100%' }}
      >
        {loading ? 'Submitting...' : 'Submit check-in'}
      </Button>

      {result && (
        <div style={s.result}>
          <div style={s.scoreGrid}>
            {Object.entries(result.scores).map(([k, v]) => (
              <div key={k} style={s.scoreCell}>
                <span style={s.scoreNum}>{v}</span>
                <span style={s.scoreKey}>{k.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          {result.derived?.flags?.length > 0 && (
            <div style={s.flags}>
              {result.derived.flags.map(f => (
                <Badge key={f} color={FLAG_COLOR[f] || 'muted'}>{f.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          )}

          <p style={s.reply}>{result.agent_reply}</p>
        </div>
      )}
    </div>
  )
}

const s = {
  root: { display:'flex', flexDirection:'column', gap:16, height:'100%', overflowY:'auto', paddingBottom:8 },
  sliders: { display:'flex', flexDirection:'column', gap:14 },
  sliderRow: { display:'flex', flexDirection:'column', gap:6 },
  sliderHeader: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  sliderLabel: { fontSize:12, color:'var(--text-secondary)' },
  sliderVal: { fontSize:16, fontFamily:'var(--font-display)', fontWeight:700 },
  trackWrap: { position:'relative', height:4, background:'var(--bg-hover)', borderRadius:'var(--r-full)' },
  trackFill: { position:'absolute', left:0, top:0, height:'100%', borderRadius:'var(--r-full)', opacity:0.5, pointerEvents:'none' },
  range: { position:'absolute', inset:0, width:'100%', opacity:0, cursor:'pointer', height:4 },
  result: {
    background:'var(--bg-surface)', border:'1px solid var(--border-dim)',
    borderRadius:'var(--r-lg)', padding:12, display:'flex', flexDirection:'column', gap:10,
    animation:'fadeUp 0.3s ease',
  },
  scoreGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 },
  scoreCell: { display:'flex', flexDirection:'column', alignItems:'center', gap:2 },
  scoreNum: { fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--green)' },
  scoreKey: { fontSize:9, color:'var(--text-muted)', textTransform:'capitalize', textAlign:'center' },
  flags: { display:'flex', flexWrap:'wrap', gap:4 },
  reply: { fontSize:12, color:'var(--text-secondary)', lineHeight:1.65 },
}