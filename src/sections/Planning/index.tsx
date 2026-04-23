import { useState } from 'react'
import { Plus, Trash2, Copy } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { usePlanningStore } from '../../store/usePlanningStore'
import type { ContentItem, ContentPlatform, ContentType, ContentStatus } from '../../types'

const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  Instagram: '#E1306C',
  SoundCloud: '#FF5500',
  YouTube: '#FF0000',
  TikTok: '#010101',
  Spotify: '#1DB954',
}

const PLATFORMS: ContentPlatform[] = ['Instagram', 'SoundCloud', 'YouTube', 'TikTok', 'Spotify']
const TYPES: ContentType[] = ['Post', 'Story', 'Reel', 'Upload', 'Live', 'Pitch']
const STATUSES: ContentStatus[] = ['idea', 'draft', 'ready', 'published']
const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idée', draft: 'Brouillon', ready: 'Prêt', published: 'Publié',
}
const STATUS_CSS: Record<ContentStatus, string> = {
  idea: 'badge-todo', draft: 'badge-progress', ready: 'badge-blue', published: 'badge-done',
}

const SUGGESTED_HASHTAGS = [
  'techhouse', 'afrohouse', 'paris', 'dj', 'newartist', 'house', 'housemusic',
  'electronicmusic', 'djset', 'producer', 'musicproducer', 'afro', 'club',
  'nightlife', 'rave', 'underground',
]

function PlatformDot({ platform }: { platform: ContentPlatform }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: PLATFORM_COLORS[platform],
        flexShrink: 0,
      }}
    />
  )
}

function ContentForm({
  initial,
  defaultDate,
  onSave,
  onClose,
}: {
  initial?: Partial<ContentItem>
  defaultDate?: string
  onSave: (item: Omit<ContentItem, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<ContentItem, 'id'>>({
    platform: 'Instagram',
    type: 'Post',
    title: '',
    description: '',
    caption: '',
    hashtags: [],
    scheduledDate: defaultDate || new Date().toISOString().split('T')[0],
    status: 'idea',
    ...initial,
  })
  const [hashInput, setHashInput] = useState('')

  function addHashtag(tag: string) {
    const clean = tag.replace(/^#/, '').trim()
    if (!clean || form.hashtags?.includes(clean)) return
    setForm(f => ({ ...f, hashtags: [...(f.hashtags || []), clean] }))
    setHashInput('')
  }

  function removeHashtag(tag: string) {
    setForm(f => ({ ...f, hashtags: (f.hashtags || []).filter(h => h !== tag) }))
  }

  function submit() {
    if (!form.title) return
    onSave(form)
    onClose()
  }

  const captionLen = form.caption?.length || 0
  const isInstagram = form.platform === 'Instagram'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial?.id ? 'Éditer le contenu' : 'Nouveau contenu'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label>Plateforme</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as ContentPlatform }))}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContentType }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group">
              <label>Titre *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Date planifiée</label>
              <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Description interne</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ margin: 0 }}>Caption</label>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: captionLen > (isInstagram ? 2200 : 9999) ? 'var(--red)' : 'var(--muted)' }}>
                {captionLen}{isInstagram ? '/2200' : ''}
              </span>
            </div>
            <textarea rows={3} value={form.caption || ''} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Texte du post..." />
          </div>
          <div className="form-group">
            <label>Hashtags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {(form.hashtags || []).map(tag => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-alt)', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
                  #{tag}
                  <button onClick={() => removeHashtag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                value={hashInput}
                onChange={e => setHashInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { addHashtag(hashInput) } }}
                placeholder="#hashtag"
              />
              <button className="btn btn-secondary btn-sm" onClick={() => addHashtag(hashInput)}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {SUGGESTED_HASHTAGS.filter(h => !(form.hashtags || []).includes(h)).map(h => (
                <button key={h} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => addHashtag(h)}>#{h}</button>
              ))}
            </div>
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

function CalendarView({
  items,
  onDateClick,
  onItemClick,
}: {
  items: ContentItem[]
  onDateClick: (date: string) => void
  onItemClick: (item: ContentItem) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>←</button>
        <span style={{ fontWeight: 600, fontSize: 15, minWidth: 140, textAlign: 'center' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border-light)' }}>
        {weekDays.map(d => (
          <div key={d} style={{ background: 'var(--surface-alt)', padding: '8px 4px', textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            {d}
          </div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayItems = items.filter(i => i.scheduledDate === dateStr)
          const inMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              style={{
                background: isToday ? 'var(--surface-alt)' : 'var(--surface)',
                minHeight: 80,
                padding: '6px 6px',
                cursor: 'pointer',
                opacity: inMonth ? 1 : 0.4,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-alt)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isToday ? 'var(--surface-alt)' : 'var(--surface)' }}
            >
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: isToday ? 'var(--dark)' : 'var(--muted)', marginBottom: 4, fontWeight: isToday ? 700 : 400 }}>
                {format(day, 'd')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayItems.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    onClick={e => { e.stopPropagation(); onItemClick(item) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: PLATFORM_COLORS[item.platform] + '22',
                      borderLeft: `2px solid ${PLATFORM_COLORS[item.platform]}`,
                      padding: '2px 4px',
                      borderRadius: 2,
                      fontSize: 10,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>+{dayItems.length - 3}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListView({
  items,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  items: ContentItem[]
  onEdit: (item: ContentItem) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = items
    .filter(i => filterPlatform === 'all' || i.platform === filterPlatform)
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 0, minWidth: 140 }}>
          <label>Plateforme</label>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            <option value="all">Toutes</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 0, minWidth: 120 }}>
          <label>Statut</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tous</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Plateforme</th>
              <th>Type</th>
              <th>Titre</th>
              <th>Date</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => onEdit(item)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PlatformDot platform={item.platform} />
                    <span>{item.platform}</span>
                  </div>
                </td>
                <td><span className="badge badge-todo">{item.type}</span></td>
                <td><strong>{item.title}</strong></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td><span className={`badge ${STATUS_CSS[item.status]}`}>{STATUS_LABELS[item.status]}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDuplicate(item.id)} title="Dupliquer">
                      <Copy size={12} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => onDelete(item.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state"><p>Aucun contenu correspondant.</p></div>
        )}
      </div>
    </div>
  )
}

export default function Planning() {
  const { items, addItem, updateItem, deleteItem, duplicateItem } = usePlanningStore()
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [showAdd, setShowAdd] = useState(false)
  const [defaultDate, setDefaultDate] = useState('')
  const [editing, setEditing] = useState<ContentItem | null>(null)

  function handleDateClick(date: string) {
    setDefaultDate(date)
    setShowAdd(true)
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Planning Contenu</div>
          <div className="section-subtitle">{items.length} éléments planifiés</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="view-toggle">
            <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>Calendrier</button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button>
          </div>
          <button className="btn btn-primary" onClick={() => { setDefaultDate(''); setShowAdd(true) }}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView
          items={items}
          onDateClick={handleDateClick}
          onItemClick={setEditing}
        />
      ) : (
        <ListView
          items={items}
          onEdit={setEditing}
          onDelete={deleteItem}
          onDuplicate={duplicateItem}
        />
      )}

      {showAdd && (
        <ContentForm
          defaultDate={defaultDate}
          onSave={addItem}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <ContentForm
          initial={editing}
          onSave={updates => { updateItem(editing.id, updates); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
