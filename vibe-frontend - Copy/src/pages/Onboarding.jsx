import { useState } from 'react'
import { createSession } from '@/api/client'
import { useStore } from '@/store'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: '💪', label: 'Fitness coaching' },
  { icon: '🥗', label: 'Nutrition guidance' },
  { icon: '😴', label: 'Sleep tracking' },
  { icon: '🧘', label: 'Mental wellness' },
  { icon: '✅', label: 'Habit tracking' },
  { icon: '📊', label: 'Progress logs' },
]

export default function Onboarding() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { setSession } = useStore()

  const handleStart = async () => {
    const trimmed = name.trim()
    if (!trimmed) return toast.error('Please enter your name')
    setLoading(true)
    try {
      const userId = trimmed.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
      const data = await createSession(userId)
      setSession(userId, data.session_id)
    } catch (err) {
      toast.error(err.message || 'Could not connect — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      {/* Background grid */}
      <div style={s.grid} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <span style={s.logoMark}>✦</span>
          <span style={s.logo}>vibe</span>
        </div>

        <h1 style={s.heading}>Your AI wellness companion</h1>
        <p style={s.sub}>
          Chat naturally about your health goals. Vibe tracks your habits,
          answers fitness questions, and keeps you motivated.
        </p>

        {/* Name input */}
        <div style={s.formGroup}>
          <label style={s.label}>What should I call you?</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="Enter your name..."
            autoFocus
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          disabled={loading || !name.trim()}
          style={{ width: '100%' }}
        >
          {loading ? 'Setting up...' : 'Get started →'}
        </Button>

        {/* Feature grid */}
        <div style={s.features}>
          {FEATURES.map(f => (
            <div key={f.label} style={s.feature}>
              <span style={s.featureIcon}>{f.icon}</span>
              <span style={s.featureLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  root: {
    height: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, opacity: 0.03,
    backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
  },
  card: {
    position: 'relative', width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', gap: 20,
    animation: 'fadeUp 0.5s ease',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoMark: { fontSize: 18, color: 'var(--green)' },
  logo: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: 28, color: 'var(--text-primary)', letterSpacing: '-1px',
  },
  heading: {
    fontFamily: 'var(--font-display)', fontWeight: 600,
    fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3,
  },
  sub: { color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  features: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8, paddingTop: 4,
  },
  feature: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '10px 6px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-dim)',
    borderRadius: 'var(--r-md)',
  },
  featureIcon: { fontSize: 18 },
  featureLabel: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' },
}