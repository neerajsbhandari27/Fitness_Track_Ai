import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'
import Chat from '@/components/Chat'

export default function Dashboard() {
  return (
    <div style={s.root}>
      <Topbar />
      <div style={s.body}>
        <Sidebar side="left" />
        <main style={s.main}>
          <Chat />
        </main>
        <Sidebar side="right" />
      </div>
    </div>
  )
}

const s = {
  root: { height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' },
  body: {
    flex:1, display:'grid',
    gridTemplateColumns:'264px 1fr 240px',
    overflow:'hidden',
  },
  main: { display:'flex', flexDirection:'column', overflow:'hidden' },
}