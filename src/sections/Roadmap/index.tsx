import { useState } from 'react'
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useRoadmapStore } from '../../store/useRoadmapStore'
import type { Milestone, MilestoneStatus } from '../../types'

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  done: 'Complété',
  progress: 'En cours',
  todo: 'À venir',
}

function StatusBadge({ status }: { status: MilestoneStatus }) {
  const cls = status === 'done' ? 'badge-done' : status === 'progress' ? 'badge-progress' : 'badge-todo'
  return <span className={`badge ${cls}`}>{STATUS_LABELS[status]}</span>
}

function MilestoneCard({
  milestone,
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  milestone: Milestone
  onUpdate: (updates: Partial<Milestone>) => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(milestone)
  const [newItem, setNewItem] = useState('')

  function saveEdit() {
    onUpdate(draft)
    setEditing(false)
  }

  function addItem() {
    if (!newItem.trim()) return
    onUpdate({ items: [...milestone.items, newItem.trim()] })
    setDraft(d => ({ ...d, items: [...d.items, newItem.trim()] }))
    setNewItem('')
  }

  return (
    <div className="milestone-card animate-in">
      <div className="milestone-left">
        <div className="milestone-year font-mono">{milestone.year}</div>
        <div className="milestone-line" />
      </div>
      <div className="milestone-body card" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div {...dragHandleProps} style={{ cursor: 'grab', color: 'var(--muted)', marginTop: 2, flexShrink: 0 }}>
            <GripVertical size={14} />
          </div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Période</label>
                    <input value={draft.year} onChange={e => setDraft(d => ({ ...d, year: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as MilestoneStatus }))}>
                      <option value="done">Complété</option>
                      <option value="progress">En cours</option>
                      <option value="todo">À venir</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Titre</label>
                  <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={2} value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Objectif chiffré (optionnel)</label>
                  <input value={draft.target || ''} onChange={e => setDraft(d => ({ ...d, target: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={saveEdit}>Enregistrer</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setDraft(milestone) }}>Annuler</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{milestone.title}</span>
                  <StatusBadge status={milestone.status} />
                  {milestone.target && (
                    <span className="badge" style={{ background: 'var(--surface-alt)', color: 'var(--mid)' }}>
                      {milestone.target}
                    </span>
                  )}
                </div>
                {milestone.description && (
                  <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 8 }}>{milestone.description}</p>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 0', color: 'var(--muted)', marginBottom: expanded ? 8 : 0 }}
                  onClick={() => setExpanded(e => !e)}
                >
                  {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  {milestone.items.length} action{milestone.items.length > 1 ? 's' : ''}
                </button>
                {expanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {milestone.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--mid)' }}>{item}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <input
                        placeholder="Ajouter une action..."
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addItem()}
                        style={{ fontSize: 12 }}
                      />
                      <button className="btn btn-secondary btn-sm" onClick={addItem}>+</button>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Éditer</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={onDelete}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .milestone-card {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .milestone-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding-top: 16px;
          min-width: 80px;
        }
        .milestone-year {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.04em;
          text-align: center;
          margin-bottom: 6px;
        }
        .milestone-line {
          width: 1px;
          flex: 1;
          min-height: 30px;
          background: var(--border-light);
        }
        .milestone-body {
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  )
}

function AddMilestoneModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Omit<Milestone, 'id'>) => void }) {
  const [form, setForm] = useState<Omit<Milestone, 'id'>>({
    year: '',
    title: '',
    description: '',
    items: [],
    status: 'todo',
    target: '',
  })
  const [newItem, setNewItem] = useState('')

  function addItem() {
    if (!newItem.trim()) return
    setForm(f => ({ ...f, items: [...f.items, newItem.trim()] }))
    setNewItem('')
  }

  function submit() {
    if (!form.year || !form.title) return
    onAdd(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nouveau jalon</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Période *</label>
              <input placeholder="ex: Q3 2026" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MilestoneStatus }))}>
                <option value="todo">À venir</option>
                <option value="progress">En cours</option>
                <option value="done">Complété</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Titre *</label>
            <input placeholder="Nom du jalon" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Objectif chiffré</label>
            <input value={form.target || ''} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Actions (une par ligne)</label>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <input value={item} onChange={e => setForm(f => ({ ...f, items: f.items.map((it, j) => j === i ? e.target.value : it) }))} />
                <button className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6 }}>
              <input placeholder="Ajouter une action..." value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
              <button className="btn btn-secondary btn-sm" onClick={addItem}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={submit} disabled={!form.year || !form.title}>Ajouter</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Roadmap() {
  const { milestones, addMilestone, updateMilestone, deleteMilestone, reorderMilestones } = useRoadmapStore()
  const [showAdd, setShowAdd] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  const done = milestones.filter(m => m.status === 'done').length

  function handleDragStart(idx: number) { setDragIdx(idx) }
  function handleDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setOverIdx(idx) }
  function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return }
    const arr = [...milestones]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(idx, 0, moved)
    reorderMilestones(arr)
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Roadmap artistique</div>
          <div className="section-subtitle">{done}/{milestones.length} jalons complétés</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Nouveau jalon
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>PROGRESSION GLOBALE</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            {milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0}%
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: milestones.length > 0 ? `${(done / milestones.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {milestones.map((m, idx) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
            style={{
              opacity: dragIdx === idx ? 0.5 : 1,
              borderTop: overIdx === idx ? '2px solid var(--dark)' : '2px solid transparent',
              transition: 'opacity 0.1s',
            }}
          >
            <MilestoneCard
              milestone={m}
              onUpdate={updates => updateMilestone(m.id, updates)}
              onDelete={() => deleteMilestone(m.id)}
            />
          </div>
        ))}
      </div>

      {milestones.length === 0 && (
        <div className="empty-state">
          <p>Aucun jalon. Cliquez sur "Nouveau jalon" pour commencer.</p>
        </div>
      )}

      {showAdd && (
        <AddMilestoneModal onClose={() => setShowAdd(false)} onAdd={addMilestone} />
      )}
    </div>
  )
}
