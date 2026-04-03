import axios from 'axios'

const http = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

http.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// Sessions
export const createSession = (userId) =>
  http.post(`/sessions?user_id=${encodeURIComponent(userId)}`).then(r => r.data)

export const getHistory = (sessionId, lastN = 50) =>
  http.get(`/sessions/${sessionId}/history?last_n=${lastN}`).then(r => r.data)

// Chat
export const sendChat = (sessionId, userId, message) =>
  http.post('/chat', { session_id: sessionId, user_id: userId, message }).then(r => r.data)

// Logs
export const getLogs = (userId, logType = null, days = 7, limit = 50) => {
  const p = new URLSearchParams({ user_id: userId, days, limit })
  if (logType) p.append('log_type', logType)
  return http.get(`/logs?${p}`).then(r => r.data)
}

export const createLog = (payload) =>
  http.post('/logs', payload).then(r => r.data)

// Check-in
export const submitCheckin = (payload) =>
  http.post('/checkin', payload).then(r => r.data)