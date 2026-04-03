import { useState, useRef, useEffect, useCallback } from 'react'
import { sendChat } from '@/api/client'
import { useStore } from '@/store'
import { Spinner } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const QUICK = [
  { label: '💪 Quick workout', text: 'Give me a quick 20-minute workout I can do at home' },
  { label: '🥗 Meal ideas',    text: 'Give me some healthy lunch ideas' },
  { label: '😴 Sleep tips',    text: 'I\'m having trouble sleeping, any tips?' },
  { label: '🧘 Feeling stressed', text: 'I\'m feeling really stressed today' },
  { label: '💧 Water intake',  text: 'How much water should I drink daily?' },
  { label: '🏃 Running plan',  text: 'Create a beginner 5K running plan for me' },
]

export default function Chat() {
  const { userId, sessionId, messages, isTyping, addMessage, setTyping } = useStore()
  const [input, setInput] = useState('')
  const textRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const send = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || isTyping) return
    setInput('')
    if (textRef.current) textRef.current.style.height = 'auto'

    addMessage({ role: 'user', content: msg, timestamp: new Date().toISOString() })
    setTyping(true)

    try {
      const data = await sendChat(sessionId, userId, msg)
      addMessage({ role: 'model', content: data.reply, timestamp: data.timestamp })
    } catch (err) {
      toast.error(err.message)
      addMessage({ role: 'model', content: '⚠️ Something went wrong. Please try again.', timestamp: new Date().toISOString() })
    } finally {
      setTyping(false)
    }
  }, [input, isTyping, sessionId, userId, addMessage, setTyping])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const onInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.agentDot} />
        <div>
          <p style={s.agentName}>Vibe</p>
          <p style={s.agentStatus}>AI Wellness Companion · online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {messages.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyTitle}>Hi there 👋</p>
            <p style={s.emptySub}>
              I'm your personal wellness companion. Tell me how you're doing,
              ask about workouts, nutrition, sleep — anything health-related.
            </p>
            <div style={s.quickGrid}>
              {QUICK.map(q => (
                <button key={q.label} style={s.quickBtn} onClick={() => send(q.text)}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ ...s.row, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'model' && <div style={s.avatar}>✦</div>}
              <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.bubbleUser : s.bubbleAI) }}>
                <p style={s.bubbleText}>{msg.content}</p>
                <span style={s.time}>
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ ...s.row, justifyContent: 'flex-start' }}>
            <div style={s.avatar}>✦</div>
            <div style={{ ...s.bubble, ...s.bubbleAI, padding: '12px 16px' }}>
              <div style={s.dots}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ ...s.dot, animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts bar — shown after first message */}
      {messages.length > 0 && (
        <div style={s.quickBar}>
          {QUICK.slice(0, 4).map(q => (
            <button key={q.label} style={s.quickBarBtn} onClick={() => send(q.text)}>
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={s.inputWrap}>
        <textarea
          ref={textRef}
          style={s.textarea}
          placeholder="Message Vibe..."
          value={input}
          onChange={onInput}
          onKeyDown={onKeyDown}
          rows={1}
        />
        <button
          style={{ ...s.sendBtn, opacity: (!input.trim() || isTyping) ? 0.35 : 1 }}
          onClick={() => send()}
          disabled={!input.trim() || isTyping}
        >
          {isTyping
            ? <Spinner size={16} color="#071209" />
            : <svg viewBox="0 0 24 24" width="18" height="18" fill="#071209"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          }
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg-base)' },
  header: {
    display:'flex', alignItems:'center', gap:10,
    padding:'13px 20px', borderBottom:'1px solid var(--border-dim)',
    flexShrink:0,
  },
  agentDot: {
    width:32, height:32, borderRadius:'50%',
    background:'var(--bg-raised)', border:'1px solid rgba(144,212,160,0.2)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:14, color:'var(--green)', flexShrink:0,
  },
  agentName: { fontSize:14, fontWeight:600, fontFamily:'var(--font-display)' },
  agentStatus: { fontSize:11, color:'var(--green)', display:'flex', alignItems:'center', gap:4 },
  messages: { flex:1, overflowY:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', paddingTop:40, animation:'fadeIn 0.4s ease' },
  emptyTitle: { fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, marginBottom:8 },
  emptySub: { color:'var(--text-secondary)', fontSize:14, maxWidth:340, marginBottom:28, lineHeight:1.65 },
  quickGrid: { display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' },
  quickBtn: {
    background:'var(--bg-surface)', border:'1px solid var(--border-soft)',
    borderRadius:'var(--r-full)', padding:'7px 14px',
    color:'var(--text-secondary)', fontSize:12,
    transition:'var(--t-base)',
  },
  row: { display:'flex', alignItems:'flex-end', gap:8, animation:'fadeUp 0.2s ease' },
  avatar: {
    width:26, height:26, borderRadius:'50%',
    background:'var(--bg-raised)', border:'1px solid var(--border-soft)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:11, color:'var(--green)', flexShrink:0,
  },
  bubble: { maxWidth:'76%', borderRadius:14, padding:'10px 14px' },
  bubbleAI: {
    background:'var(--bg-surface)', border:'1px solid var(--border-dim)',
    borderBottomLeftRadius:3,
  },
  bubbleUser: {
    background:'var(--bg-raised)', border:'1px solid rgba(126,200,232,0.15)',
    borderBottomRightRadius:3,
  },
  bubbleText: { fontSize:14, lineHeight:1.65, whiteSpace:'pre-wrap', color:'var(--text-primary)' },
  time: { fontSize:10, color:'var(--text-muted)', marginTop:4, display:'block' },
  dots: { display:'flex', gap:4, alignItems:'center' },
  dot: {
    width:6, height:6, borderRadius:'50%', background:'var(--text-muted)',
    animation:'bounce 1.2s ease-in-out infinite',
  },
  quickBar: {
    padding:'8px 16px', borderTop:'1px solid var(--border-dim)',
    display:'flex', gap:6, overflowX:'auto', flexShrink:0,
  },
  quickBarBtn: {
    background:'transparent', border:'1px solid var(--border-dim)',
    borderRadius:'var(--r-full)', padding:'4px 11px',
    color:'var(--text-muted)', fontSize:11, whiteSpace:'nowrap', flexShrink:0,
  },
  inputWrap: {
    padding:'12px 16px', borderTop:'1px solid var(--border-dim)',
    display:'flex', gap:10, alignItems:'flex-end', flexShrink:0,
    background:'var(--bg-base)',
  },
  textarea: {
    flex:1, background:'var(--bg-surface)', border:'1px solid var(--border-soft)',
    borderRadius:'var(--r-md)', padding:'10px 14px', color:'var(--text-primary)',
    fontSize:14, resize:'none', outline:'none', lineHeight:1.55,
    minHeight:44, maxHeight:140, transition:'border-color var(--t-fast)',
  },
  sendBtn: {
    width:42, height:42, borderRadius:'50%', background:'var(--green)',
    border:'none', display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0, transition:'var(--t-base)',
  },
}