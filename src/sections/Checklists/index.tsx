import { useState } from 'react'
import { Plus, Archive, Copy, Trash2, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { useChecklistsStore } from '../../store/useChecklistsStore'
import type { Checklist, ChecklistItem, ChecklistType } from '../../types'

const TYPE_LABELS: Record<ChecklistType, string> = {
  'pre-release': 'Pré-release',
  'post-release': 'Post-release',
  'set': 'Set / Live',
  'pitch': 'Pitch Playlist',
  'collab': 'Collaboration',
  'custom': 'Personnalisé',
}

const TYPE_COLORS: Record<ChecklistType, string> = {
  'pre-release': 'badge-blue',
  'post-release': 'badge-done',
  'set': 'badge-progress',
  'pitch': 'badge-todo',
  'collab': 'badge-todo',
  'custom': 'badge-todo',
}

function isOverdue(deadline?: string): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

function ChecklistCard({
  checklist,
  onToggle,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onArchive,
  onDelete,
  onDuplicate,
}: {
  checklist: Checklist
  onToggle: (itemId: string) => void
  onUpdateItem: (itemId: string, updates: Partial<ChecklistItem>) => void
  onAddItem: (label: string) => void
  onRemoveItem: (itemId: string) => void
  onArchive: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const done = checklist.items.filter(i => i.done).length
  const total = checklist.items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  function addItem() {
    if (!newItemLabel.trim()) return
    onAddItem(newItemLabel.trim())
    setNewItemLabel('')
  }

  return (
    <div className="card animate-in" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 4px' }}
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{checklist.name}</span>
            <span className={`badge ${TYPE_COLORS[checklist.type]}`}>{TYPE_LABELS[checklist.type]}</span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                {done}/{total} items
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: pct === 100 ? 'var(--green)' : 'var(--muted)' }}>
                {pct}%
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--dark)' }}
              />
            </div>
          </div>

          {expanded && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
                {checklist.items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: item.done ? 'var(--surface-alt)' : 'transparent',
                      border: `1px solid ${isOverdue(item.deadline) && !item.done ? 'var(--red)' : 'transparent'}`,
                      transition: 'background 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => onToggle(item.id)}
                      style={{ marginTop: 2 }}
                    />
                    {editingItemId === item.id ? (
                      <input
                        autoFocus
                        value={item.label}
                        onChange={e => onUpdateItem(item.id, { label: e.target.value })}
                        onBlur={() => setEditingItemId(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditingItemId(null)}
                        style={{ flex: 1, fontSize: 13 }}
                      />
                    ) : (
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: item.done ? 'var(--muted)' : 'var(--dark)',
                          textDecoration: item.done ? 'line-through' : 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => setEditingItemId(item.id)}
                      >
                        {item.label}
                      </span>
                    )}
                    {isOverdue(item.deadline) && !item.done && (
                      <span title={`Deadline: ${item.deadline}`}><AlertTriangle size={13} color="var(--red)" /></span>
                    )}
                    {item.deadline && (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: isOverdue(item.deadline) && !item.done ? 'var(--red)' : 'var(--muted)', flexShrink: 0 }}>
                        {new Date(item.deadline).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {item.assignedTo && (
                      <span style={{ fontSize: 10, background: 'var(--surface-alt)', padding: '1px 6px', borderRadius: 4, color: 'var(--mid)', flexShrink: 0 }}>
                        {item.assignedTo}
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <input
                        type="date"
                        value={item.deadline || ''}
                        onChange={e => onUpdateItem(item.id, { deadline: e.target.value || undefined })}
                        style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
                        id={`deadline-${item.id}`}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '1px 4px', fontSize: 10 }}
                        title="Assigner"
                        onClick={() => {
                          const name = prompt('Assigner à :')
                          if (name !== null) onUpdateItem(item.id, { assignedTo: name || undefined })
                        }}
                      >
                        @
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '1px 4px', color: 'var(--red)' }}
                        onClick={() => onRemoveItem(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  placeholder="Ajouter un item..."
                  value={newItemLabel}
                  onChange={e => setNewItemLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  style={{ fontSize: 13 }}
                />
                <button className="btn btn-secondary btn-sm" onClick={addItem}>+</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexDirection: 'column' }}>
          <button className="btn btn-ghost btn-sm" title="Dupliquer" onClick={onDuplicate}><Copy size={12} /></button>
          <button className="btn btn-ghost btn-sm" title="Archiver" onClick={onArchive}><Archive size={12} /></button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} title="Supprimer" onClick={onDelete}><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  )
}

function AddChecklistModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (c: Omit<Checklist, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ChecklistType>('custom')

  function submit() {
    if (!name.trim()) return
    onAdd({ name, type, items: [] })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nouvelle checklist</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label>Nom *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pré-release — Track #2" autoFocus />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value as ChecklistType)}>
              {(Object.entries(TYPE_LABELS) as [ChecklistType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={submit} disabled={!name.trim()}>Créer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DuplicateModal({ checklist, onClose, onDuplicate }: {
  checklist: Checklist
  onClose: () => void
  onDuplicate: (name: string) => void
}) {
  const [name, setName] = useState(`${checklist.name} (copie)`)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Dupliquer la checklist</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label>Nom de la copie</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={() => { onDuplicate(name); onClose() }}>Dupliquer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Checklists() {
  const { checklists, addChecklist, updateChecklist, deleteChecklist, duplicateChecklist, toggleItem, updateItem, addItem, removeItem } = useChecklistsStore()
  const [showAdd, setShowAdd] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [duplicating, setDuplicating] = useState<Checklist | null>(null)

  const active = checklists.filter(c => !c.archived)
  const archived = checklists.filter(c => c.archived)

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Checklists</div>
          <div className="section-subtitle">{active.length} checklist{active.length > 1 ? 's' : ''} active{active.length > 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {archived.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowArchived(a => !a)}>
              <Archive size={14} /> {showArchived ? 'Masquer archivées' : `${archived.length} archivée${archived.length > 1 ? 's' : ''}`}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Nouvelle checklist
          </button>
        </div>
      </div>

      {active.map(c => (
        <ChecklistCard
          key={c.id}
          checklist={c}
          onToggle={itemId => toggleItem(c.id, itemId)}
          onUpdateItem={(itemId, updates) => updateItem(c.id, itemId, updates)}
          onAddItem={label => addItem(c.id, label)}
          onRemoveItem={itemId => removeItem(c.id, itemId)}
          onArchive={() => updateChecklist(c.id, { archived: true })}
          onDelete={() => deleteChecklist(c.id)}
          onDuplicate={() => setDuplicating(c)}
        />
      ))}

      {active.length === 0 && (
        <div className="empty-state"><p>Aucune checklist active. Créez-en une ou dupliquez un template.</p></div>
      )}

      {showArchived && archived.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Archivées
          </div>
          {archived.map(c => (
            <div key={c.id} className="card" style={{ marginBottom: 8, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{c.name}</span>
              <span className={`badge ${TYPE_COLORS[c.type]}`}>{TYPE_LABELS[c.type]}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {c.items.filter(i => i.done).length}/{c.items.length}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => updateChecklist(c.id, { archived: false })}>Restaurer</button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteChecklist(c.id)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddChecklistModal onClose={() => setShowAdd(false)} onAdd={addChecklist} />}
      {duplicating && (
        <DuplicateModal
          checklist={duplicating}
          onClose={() => setDuplicating(null)}
          onDuplicate={name => { duplicateChecklist(duplicating.id, name); setDuplicating(null) }}
        />
      )}
    </div>
  )
}
