import { Toaster } from 'react-hot-toast'
import { useStore } from '@/store'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  const isReady = useStore(s => s.isReady)
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-raised)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-soft)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-raised)' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg-raised)' } },
        }}
      />
      {isReady ? <Dashboard /> : <Onboarding />}
    </>
  )
}