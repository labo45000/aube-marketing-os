import { useState } from 'react'
import { Download, Maximize2, Minimize2 } from 'lucide-react'
import { exportGlobalPDF } from '../utils/pdfExport'

export default function Header() {
  const [presenting, setPresenting] = useState(false)

  function togglePresentation() {
    if (presenting) {
      document.body.classList.remove('presentation-mode')
      setPresenting(false)
    } else {
      document.body.classList.add('presentation-mode')
      setPresenting(true)
    }
  }

  return (
    <header className="app-header">
      <span className="header-logo">∆ÜBE</span>
      <span className="header-title font-mono">Marketing OS</span>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={togglePresentation} title="Mode présentation">
          {presenting ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span>{presenting ? 'Quitter présentation' : 'Présentation'}</span>
        </button>
        <button className="btn btn-secondary btn-sm" onClick={exportGlobalPDF}>
          <Download size={14} />
          Export PDF
        </button>
      </div>
      <style>{`
        .app-header {
          position: fixed;
          top: 0;
          left: 220px;
          right: 0;
          height: 56px;
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 12px;
          z-index: 90;
        }
        .header-logo {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 300;
          color: var(--dark);
          letter-spacing: 0.04em;
        }
        .header-title {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      `}</style>
    </header>
  )
}
