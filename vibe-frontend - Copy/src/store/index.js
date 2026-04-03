import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const isValidObjectId = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v)

export const useStore = create(
  persist(
    (set) => ({
      // Identity
      userId: '',
      sessionId: '',
      isReady: false,
      setSession: (userId, sessionId) => set({ userId, sessionId, isReady: true }),
      clearSession: () => set({ userId: '', sessionId: '', isReady: false, messages: [] }),

      // Chat
      messages: [],
      isTyping: false,
      addMessage: (msg) => set(s => ({ messages: [...s.messages, { ...msg, id: crypto.randomUUID() }] })),
      setTyping: (v) => set({ isTyping: v }),

      // Logs
      logs: [],
      setLogs: (logs) => set({ logs }),

      // Check-in result
      lastCheckin: null,
      setLastCheckin: (c) => set({ lastCheckin: c }),

      // Active sidebar tab
      sidebarTab: 'checkin',
      setSidebarTab: (t) => set({ sidebarTab: t }),
    }),
    {
      name: 'vibe-app',
      partialize: s => ({ userId: s.userId, sessionId: s.sessionId, isReady: s.isReady }),
      merge: (persisted, current) => {
        if (!isValidObjectId(persisted?.sessionId) || !persisted?.userId) {
          return { ...current, userId: '', sessionId: '', isReady: false }
        }
        return { ...current, ...persisted }
      },
    }
  )
)