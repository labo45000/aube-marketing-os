import { useState } from 'react'
import { Plus, Copy, Trash2, ExternalLink } from 'lucide-react'
import { useReleasesStore } from '../../store/useReleasesStore'
import type { Release, ReleaseStatus, ReleaseType } from '../../types'
import { formatDateFR } from '../../utils/storage'

const STATUSES: ReleaseStatus[] = ['idea', 'wip', 'recorded', 'mixed', 'mastered', 'submitted', 'live']
const STATUS_LABELS: Record<ReleaseStatus, string> = {
  idea: 'Idée', wip: 'En cours', recorded: 'Enregistré',
  mixed: 'Mixé', mastered: 'Masterisé', submitted: 'Soumis', live: 'Live',
}
const STATUS_COLORS: Record<ReleaseStatus, string> = {
  idea: 'badge-todo', wip: 'badge-progress', recorded: 'badge-progress',
  mixed: 'badge-progress', mastered: 'badge-blue', submitted: 'badge-blue', live: 'badge-done',
}
const RELEASE_TYPES: ReleaseType[] = ['Original', 'Remix', 'Edit', 'EP', 'Set']
const PLATFORMS = ['SoundCloud', 'Spotify', 'Apple Music', 'YouTube', 'Beatport', 'Bandcamp', 'Deezer']

function ReleaseForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<Release>
  onSave: (r: Omit<Release, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Release, 'id' | 'createdAt'>>({
    title: '',
    artistCredit: '∆ÜBE',
    type: 'Original',
    status: 'idea',
    genre: '',
    platforms: [],
    links: [],
    notes: '',
    ...initial,
  })

  function togglePlatform(p: string) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }))
  }

  function submit() {
    if (!form.title) return
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial?.id ? 'Éditer la release' : 'Nouvelle release'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group">
              <label>Titre *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nom du track" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ReleaseType }))}>
                {RELEASE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Crédit artiste</label>
              <input value={form.artistCredit} onChange={e => setForm(f => ({ ...f, artistCredit: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReleaseStatus }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label>Genre</label>
              <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="Tech House" />
            </div>
            <div className="form-group">
              <label>BPM</label>
              <input type="number" value={form.bpm || ''} onChange={e => setForm(f => ({ ...f, bpm: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div className="form-group">
              <label>Tonalité</label>
              <input value={form.key || ''} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} placeholder="Am, Gm..." />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label>LUFS</label>
              <input value={form.lufs || ''} onChange={e => setForm(f => ({ ...f, lufs: e.target.value }))} placeholder="-14" />
            </div>
            <div className="form-group">
              <label>Date de sortie</label>
              <input type="date" value={form.releaseDate || ''} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Distributeur</label>
              <input value={form.distributor || ''} onChange={e => setForm(f => ({ ...f, distributor: e.target.value }))} placeholder="DistroKid..." />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>ISRC</label>
              <input value={form.isrc || ''} onChange={e => setForm(f => ({ ...f, isrc: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>UPC</label>
              <input value={form.upc || ''} onChange={e => setForm(f => ({ ...f, upc: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Plateformes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${form.platforms.includes(p) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>URL Artwork</label>
            <input value={form.artworkUrl || ''} onChange={e => setForm(f => ({ ...f, artworkUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={submit} disabled={!form.title}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReleaseDetail({ release, onEdit, onDelete, onClose }: {
  release: Release
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    alert(`${label} copié !`)
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{release.title}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{release.artistCredit}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          <span className={`badge ${STATUS_COLORS[release.status]}`}>{STATUS_LABELS[release.status]}</span>
          <span className="badge badge-todo">{release.type}</span>
          {release.genre && <span className="badge badge-todo">{release.genre}</span>}
          {release.bpm && <span className="badge badge-todo">{release.bpm} BPM</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {release.releaseDate && (
            <div><label>Date de sortie</label><div style={{ fontSize: 13 }}>{formatDateFR(release.releaseDate)}</div></div>
          )}
          {release.distributor && (
            <div><label>Distributeur</label><div style={{ fontSize: 13 }}>{release.distributor}</div></div>
          )}
          {release.key && (
            <div><label>Tonalité</label><div style={{ fontSize: 13 }}>{release.key}</div></div>
          )}
          {release.lufs && (
            <div><label>LUFS</label><div style={{ fontSize: 13 }}>{release.lufs}</div></div>
          )}
        </div>

        {(release.isrc || release.upc) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {release.isrc && (
              <button className="btn btn-secondary btn-sm" onClick={() => copy(release.isrc!, 'ISRC')}>
                <Copy size={12} /> ISRC : {release.isrc}
              </button>
            )}
            {release.upc && (
              <button className="btn btn-secondary btn-sm" onClick={() => copy(release.upc!, 'UPC')}>
                <Copy size={12} /> UPC : {release.upc}
              </button>
            )}
          </div>
        )}

        {release.platforms.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ marginBottom: 6 }}>Plateformes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {release.platforms.map(p => <span key={p} className="badge badge-blue">{p}</span>)}
            </div>
          </div>
        )}

        {release.links.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ marginBottom: 6 }}>Liens</label>
            {release.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ display: 'flex', marginBottom: 4 }}>
                <ExternalLink size={12} /> {l.platform}
              </a>
            ))}
          </div>
        )}

        {release.notes && (
          <div style={{ marginBottom: 16 }}>
            <label>Notes</label>
            <p style={{ fontSize: 13, color: 'var(--mid)', whiteSpace: 'pre-wrap' }}>{release.notes}</p>
          </div>
        )}

        <hr className="divider" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>Éditer</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={12} /> Supprimer</button>
        </div>
      </div>
    </div>
  )
}

function KanbanView({ releases, onSelect }: {
  releases: Release[]
  onSelect: (r: Release) => void
}) {
  const { updateRelease } = useReleasesStore()
  const [dragId, setDragId] = useState<string | null>(null)

  function handleDrop(status: ReleaseStatus) {
    if (!dragId) return
    updateRelease(dragId, { status })
    setDragId(null)
  }

  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, minHeight: 400 }}>
      {STATUSES.map(status => {
        const cols = releases.filter(r => r.status === status)
        return (
          <div
            key={status}
            style={{ minWidth: 180, maxWidth: 200, flexShrink: 0 }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(status)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span className={`badge ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{cols.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cols.map(r => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={() => setDragId(r.id)}
                  className="card"
                  style={{ padding: 10, cursor: 'grab', opacity: dragId === r.id ? 0.5 : 1, transition: 'opacity 0.1s' }}
                  onClick={() => onSelect(r)}
                >
                  <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <span className="badge badge-todo" style={{ fontSize: 10 }}>{r.type}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{r.genre}</span>
                    {r.bpm && <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{r.bpm}</span>}
                  </div>
                </div>
              ))}
              {cols.length === 0 && (
                <div style={{ height: 60, border: '1px dashed var(--border-light)', borderRadius: 6 }} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Releases() {
  const { releases, addRelease, updateRelease, deleteRelease } = useReleasesStore()
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Release | null>(null)
  const [editing, setEditing] = useState<Release | null>(null)
  const [sortKey, setSortKey] = useState<keyof Release>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)

  function handleSort(key: keyof Release) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sorted = [...releases].sort((a, b) => {
    const av = String(a[sortKey] ?? '')
    const bv = String(b[sortKey] ?? '')
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Releases</div>
          <div className="section-subtitle">{releases.length} track{releases.length > 1 ? 's' : ''} dans le catalogue</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="view-toggle">
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Tableau</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Kanban</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                {([['title', 'Titre'], ['type', 'Type'], ['status', 'Statut'], ['genre', 'Genre'], ['bpm', 'BPM'], ['releaseDate', 'Date'], ['platforms', 'Plateformes']] as [keyof Release, string][]).map(([k, l]) => (
                  <th key={k} onClick={() => handleSort(k)}>
                    {l} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.id} onClick={() => setSelected(r)}>
                  <td><strong>{r.title}</strong></td>
                  <td><span className="badge badge-todo">{r.type}</span></td>
                  <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span></td>
                  <td style={{ color: 'var(--mid)' }}>{r.genre}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.bpm || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--mid)' }}>{r.releaseDate ? formatDateFR(r.releaseDate) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.platforms.slice(0, 3).map(p => <span key={p} className="badge badge-blue" style={{ fontSize: 10 }}>{p}</span>)}
                      {r.platforms.length > 3 && <span className="badge badge-todo" style={{ fontSize: 10 }}>+{r.platforms.length - 3}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {releases.length === 0 && (
            <div className="empty-state"><p>Aucune release. Cliquez sur "Ajouter" pour commencer.</p></div>
          )}
        </div>
      ) : (
        <KanbanView
          releases={releases}
          onSelect={setSelected}
        />
      )}

      {showAdd && (
        <ReleaseForm onSave={addRelease} onClose={() => setShowAdd(false)} />
      )}
      {editing && (
        <ReleaseForm
          initial={editing}
          onSave={updates => { updateRelease(editing.id, updates); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
      {selected && (
        <ReleaseDetail
          release={selected}
          onEdit={() => { setEditing(selected); setSelected(null) }}
          onDelete={() => { deleteRelease(selected.id); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
