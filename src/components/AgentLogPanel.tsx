import { useMcpStore } from '../store/useMcpStore'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

export default function AgentLogPanel() {
  const { events, logPanelOpen, toggleLogPanel, clearEvents } = useMcpStore()

  const panelHeight = logPanelOpen ? 240 : 0

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 220,
          right: 0,
          zIndex: 80,
          background: '#1A1916',
          borderTop: '1px solid #2A2825',
          transition: 'height 0.2s ease',
          height: panelHeight + 36,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 16px',
            height: 36,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={toggleLogPanel}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4ADE80', letterSpacing: '0.06em' }}>
            AGENT LOG
          </span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4A4845', marginLeft: 4 }}>
            {events.length} action{events.length !== 1 ? 's' : ''}
          </span>
          <div style={{ flex: 1 }} />
          {logPanelOpen && events.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearEvents() }}
              style={{ background: 'none', border: 'none', color: '#4A4845', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
              title="Effacer les logs"
            >
              <Trash2 size={12} />
            </button>
          )}
          {logPanelOpen ? <ChevronDown size={13} color="#4A4845" /> : <ChevronUp size={13} color="#4A4845" />}
        </div>

        {/* Log content */}
        {logPanelOpen && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {events.length === 0 ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3A3835', fontStyle: 'italic' }}>
                Aucune action agent enregistrée pour cette session.
              </span>
            ) : (
              events.map(event => (
                <div key={event.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4A4845', flexShrink: 0, paddingTop: 1 }}>
                    {new Date(event.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: '#6A6865',
                      flexShrink: 0,
                      background: '#222220',
                      padding: '1px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {event.tool}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: event.success ? '#4ADE80' : '#F87171', flex: 1 }}>
                    {event.success ? '✓' : '✗'} {event.summary}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom padding so content doesn't hide behind panel */}
      <div style={{ height: 36 }} />
    </>
  )
}
