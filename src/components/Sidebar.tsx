import { NavLink } from 'react-router-dom'
import { BarChart2, Calendar, CheckSquare, Disc, Mail, Map, Package, Bot, Settings } from 'lucide-react'
import { useMcpStore } from '../store/useMcpStore'

const navItems = [
  { path: '/roadmap', icon: Map, label: 'Roadmap' },
  { path: '/releases', icon: Disc, label: 'Releases' },
  { path: '/planning', icon: Calendar, label: 'Planning' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/checklists', icon: CheckSquare, label: 'Checklists' },
  { path: '/outreach', icon: Mail, label: 'Outreach' },
  { path: '/assets', icon: Package, label: 'Assets & Bio' },
  { path: '/settings', icon: Settings, label: 'Réglages' },
]

export default function Sidebar() {
  const { connected, events, toggleLogPanel } = useMcpStore()
  const recentErrors = events.filter(e => !e.success).length

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">∆ÜBE</div>
      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={toggleLogPanel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
            width: '100%',
          }}
          title="Ouvrir le journal agent"
        >
          <Bot size={13} color={connected ? '#4ADE80' : '#4A4845'} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: connected ? '#4ADE80' : '#4A4845',
              letterSpacing: '0.04em',
            }}
          >
            {connected ? 'Agent connecté' : 'Agent hors ligne'}
          </span>
          {recentErrors > 0 && (
            <span style={{ marginLeft: 'auto', background: '#7A2020', color: '#F5D8D8', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
              {recentErrors}
            </span>
          )}
        </button>
        <span className="font-mono" style={{ fontSize: 10, color: '#3A3835' }}>Marketing OS v1 + MCP</span>
      </div>
      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 220px;
          background: #1A1916;
          display: flex;
          flex-direction: column;
          z-index: 100;
          border-right: 1px solid #2A2825;
        }
        .sidebar-logo {
          padding: 20px 20px 16px;
          font-family: var(--font-mono);
          font-size: 20px;
          font-weight: 300;
          color: #FAFAF7;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #2A2825;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 6px;
          color: #8A8880;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-item:hover { background: #2A2825; color: #FAFAF7; }
        .sidebar-item.active { background: #3A3835; color: #FAFAF7; }
        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #2A2825;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>
    </aside>
  )
}
