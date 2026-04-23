import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AgentLogPanel from './components/AgentLogPanel'
import Roadmap from './sections/Roadmap'
import Releases from './sections/Releases'
import Planning from './sections/Planning'
import Analytics from './sections/Analytics'
import Checklists from './sections/Checklists'
import Outreach from './sections/Outreach'
import Assets from './sections/Assets'
import Settings from './sections/Settings'
import { useMcpSync } from './hooks/useMcpSync'

function AppShell() {
  useMcpSync()

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main
          className="main-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            paddingTop: '80px',
            paddingBottom: '60px',
            background: 'var(--bg)',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/roadmap" replace />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <AgentLogPanel />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
