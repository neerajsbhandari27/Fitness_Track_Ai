import { useEffect, useState } from 'react'
import { getLogs, createLog } from '@/api/client'
import { useStore } from '@/store'
import { Button, Input, Select, Badge, SectionLabel, Spinner } from '@/components/ui'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const TYPES = ['sleep','meal','habit','mood','exercise','water']
const META = {
  sleep:    { icon:'😴', color:'var(--purple)', unit:'hours',   badge:'purple' },
  meal:     { icon:'🥗', color:'var(--amber)',  unit:'',        badge:'amber'  },
  habit:    { icon:'✅', color:'var(--green)',  unit:'',        badge:'green'  },
  mood:     { icon:'😊', color:'var(--blue)',   unit:'/10',     badge:'blue'   },
  exercise: { icon:'💪', color:'var(--red)',    unit:'min',     badge:'red'    },
  water:    { icon:'💧', color:'var(--blue)',   unit:'ml',      badge:'blue'   },
}

export default function LogPanel() {
  const { userId, sessionId, logs, setLogs } = useStore()
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [form, setForm] = useState({ log_type:'sleep', value:'', unit:'hours', notes:'' })
  const [saving, setSaving] = useState(false)

  const fetchLogs = async () => {
    if (!userId) return
    setFetching(true)
    try {
      const data = await getLogs(userId, filter === 'all' ? null : filter, 7, 50)
      setLogs(data.entries)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchLogs() }, [userId, filter])

  const handleAdd = async () => {
    if (!form.value.toString().trim()) return toast.error('Enter a value')
    setSaving(true)
    try {
      await createLog({
        user_id: userId, session_id: sessionId,
        log_type: form.log_type,
        value: isNaN(form.value) ? form.value : Number(form.value),
        unit: form.unit || null,
        notes: form.notes || null,
      })
      toast.success('Entry saved!')
      setShowAdd(false)
      setForm({ log_type:'sleep', value:'', unit:'hours', notes:'' })
      fetchLogs()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const onTypeChange = (type) => {
    const defaultUnit = META[type]?.unit?.replace('/10','') || ''
    setForm(f => ({ ...f, log_type:type, unit:defaultUnit }))
  }

  const filtered = filter === 'all' ? logs : logs.filter(l => l.log_type === filter)

  return (
    <div style={s.root}>
      <div style={s.header}>
        <SectionLabel>Wellness logs</SectionLabel>
        <button style={s.addToggle} onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ cancel' : '+ add entry'}
        </button>
      </div>

      {/* Type filter */}
      <div style={s.filters}>
        {['all', ...TYPES].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              ...s.filterBtn,
              ...(filter === t ? s.filterActive : {}),
              ...(t !== 'all' ? { color: META[t]?.color } : {}),
            }}
          >
            {t === 'all' ? 'All' : META[t]?.icon}
          </button>
        ))}
        {fetching && <Spinner size={12} />}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={s.addForm}>
          <Select
            value={form.log_type}
            onChange={e => onTypeChange(e.target.value)}
          >
            {TYPES.map(t => <option key={t} value={t}>{META[t].icon} {t}</option>)}
          </Select>
          <div style={s.formRow}>
            <Input
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value:e.target.value }))}
              placeholder="Value..."
            />
            <Input
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit:e.target.value }))}
              placeholder="Unit"
              style={{ maxWidth:70 }}
            />
          </div>
          <Input
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes:e.target.value }))}
            placeholder="Notes (optional)"
          />
          <Button variant="accent" size="sm" onClick={handleAdd} disabled={saving} style={{ width:'100%' }}>
            {saving ? 'Saving...' : 'Save entry'}
          </Button>
        </div>
      )}

      {/* List */}
      <div style={s.list}>
        {filtered.length === 0 && !fetching ? (
          <p style={s.empty}>
            {filter === 'all'
              ? 'No logs yet — chat with Vibe or add one manually above.'
              : `No ${filter} logs in the last 7 days.`}
          </p>
        ) : (
          filtered.map(entry => {
            const meta = META[entry.log_type] || {}
            return (
              <div key={entry.log_id} style={s.entry}>
                <span style={{ ...s.entryIcon, color: meta.color }}>{meta.icon}</span>
                <div style={s.entryBody}>
                  <div style={s.entryTop}>
                    <Badge color={meta.badge || 'muted'}>{entry.log_type}</Badge>
                    <span style={s.entryTime}>
                      {format(new Date(entry.logged_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p style={s.entryValue}>
                    {String(entry.value)}{entry.unit ? ` ${entry.unit}` : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const s = {
  root: { display:'flex', flexDirection:'column', gap:12, height:'100%', overflow:'hidden' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  addToggle: { fontSize:11, color:'var(--green)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' },
  filters: { display:'flex', gap:4, alignItems:'center', flexWrap:'wrap' },
  filterBtn: {
    padding:'4px 10px', borderRadius:'var(--r-full)',
    background:'transparent', border:'1px solid var(--border-dim)',
    color:'var(--text-muted)', fontSize:12, transition:'var(--t-fast)',
  },
  filterActive: {
    background:'var(--bg-overlay)', border:'1px solid var(--border-medium)',
    color:'var(--text-primary)',
  },
  addForm: {
    background:'var(--bg-surface)', border:'1px solid var(--border-soft)',
    borderRadius:'var(--r-lg)', padding:12,
    display:'flex', flexDirection:'column', gap:8,
    animation:'fadeUp 0.2s ease', flexShrink:0,
  },
  formRow: { display:'flex', gap:6 },
  list: { flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 },
  empty: { color:'var(--text-muted)', fontSize:12, textAlign:'center', padding:'20px 0', lineHeight:1.6 },
  entry: {
    display:'flex', alignItems:'flex-start', gap:10, padding:'9px 11px',
    background:'var(--bg-surface)', border:'1px solid var(--border-dim)',
    borderRadius:'var(--r-md)',
  },
  entryIcon: { fontSize:16, marginTop:1, flexShrink:0 },
  entryBody: { flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:3 },
  entryTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  entryTime: { fontSize:10, color:'var(--text-muted)' },
  entryValue: { fontSize:13, fontWeight:500, color:'var(--text-primary)' },
}