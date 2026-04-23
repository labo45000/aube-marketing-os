import { useState, useMemo } from 'react'
import { Plus, Trash2, ExternalLink, MessageSquare } from 'lucide-react'
import { useOutreachStore } from '../../store/useOutreachStore'
import type { Contact, ContactRole, ContactStatus, ContactTier, Interaction, InteractionType } from '../../types'
import { formatDateFR } from '../../utils/storage'

const ROLES: ContactRole[] = ['Playlist curator', 'Blog/Média', 'Label', 'Booker', 'Artiste', 'Manager', 'Autre']
const STATUSES: ContactStatus[] = ['à contacter', 'contacté', 'répondu', 'positif', 'négatif', 'partenaire']
const TIERS: ContactTier[] = ['A', 'B', 'C']
const INTERACTION_TYPES: InteractionType[] = ['Email', 'DM Instagram', 'DM SoundCloud', 'Appel', 'Meeting', 'Autre']

const STATUS_CSS: Record<ContactStatus, string> = {
  'à contacter': 'badge-todo',
  'contacté': 'badge-progress',
  'répondu': 'badge-blue',
  'positif': 'badge-done',
  'négatif': 'badge-red',
  'partenaire': 'badge-done',
}

const TIER_CSS: Record<ContactTier, string> = {
  A: 'badge-done',
  B: 'badge-progress',
  C: 'badge-todo',
}

function getMessageTemplate(contact: Contact): string {
  switch (contact.role) {
    case 'Playlist curator':
      return `Bonjour ${contact.name},\n\nJ'espère que vous allez bien. Je suis ∆ÜBE, DJ/producteur basé à Paris, spécialisé en ${contact.genre || '[genre]'}.\n\nJe me permets de vous partager mon dernier titre [titre], disponible ici : [lien].\n\nJe pense qu'il s'intégrerait bien dans votre playlist — [raison personnalisée].\n\nMerci pour votre temps et votre travail éditorial.\n\nCordialement,\n∆ÜBE`
    case 'Label':
      return `Bonjour ${contact.name},\n\nJe suis ∆ÜBE, producteur français tech house / afro house.\n\nJe travaille actuellement sur [projet] et cherche un partenaire pour [distribution / release / collab].\n\nMon profil : [lien SoundCloud / Spotify]\nStreaming stats : [chiffres]\n\nDisponible pour en discuter.\n\n∆ÜBE`
    case 'Artiste':
      return `Bonjour ${contact.name},\n\nJe suis ∆ÜBE, producteur et DJ Paris basé, spécialisé tech house / afro house.\n\nJ'aimerais explorer une possible collaboration. Je suis fan de votre travail, notamment [titre / projet].\n\nSeriez-vous ouvert à un échange ?\n\nCordialement,\n∆ÜBE`
    case 'Booker':
      return `Bonjour ${contact.name},\n\nJe suis ∆ÜBE, DJ/producteur basé à Paris (tech house / afro house).\n\nJ'ai eu la chance de jouer à [venue] en [année] et je cherche à développer mes dates live.\n\nMon profil : [lien]\nEPK : [lien]\n\nDisponible pour discuter de dates ?\n\nCordialement,\n∆ÜBE`
    default:
      return `Bonjour ${contact.name},\n\nJe suis ∆ÜBE, DJ/producteur basé à Paris.\n\n[Personnaliser le message]\n\nCordialement,\n∆ÜBE`
  }
}

function ContactForm({ initial, onSave, onClose }: {
  initial?: Partial<Contact>
  onSave: (c: Omit<Contact, 'id' | 'interactions'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Contact, 'id' | 'interactions'>>({
    name: '',
    role: 'Playlist curator',
    tier: 'B',
    status: 'à contacter',
    notes: '',
    ...initial,
  })

  function submit() {
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial?.id ? 'Éditer le contact' : 'Nouveau contact'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
            <div className="form-group">
              <label>Nom *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as ContactRole }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tier</label>
              <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as ContactTier }))}>
                {TIERS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContactStatus }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Plateforme</label>
              <input value={form.platform || ''} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="Spotify, Instagram..." />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Instagram</label>
              <input value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@handle" />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label>URL profil</label>
              <input value={form.profileUrl || ''} onChange={e => setForm(f => ({ ...f, profileUrl: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Genre musical</label>
              <input value={form.genre || ''} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Audience (followers)</label>
              <input type="number" value={form.followers ?? ''} onChange={e => setForm(f => ({ ...f, followers: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={submit} disabled={!form.name.trim()}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InteractionForm({ onSave, onClose }: {
  onSave: (i: Omit<Interaction, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Interaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Email',
    summary: '',
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Ajouter une interaction</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as InteractionType }))}>
                {INTERACTION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Résumé *</label>
            <textarea rows={3} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Résultat</label>
            <input value={form.outcome || ''} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} placeholder="Réponse positive, en attente..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={() => { if (form.summary) { onSave(form); onClose() } }} disabled={!form.summary}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactDrawer({ contact, onClose, onEdit, onDelete }: {
  contact: Contact
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { addInteraction, deleteInteraction } = useOutreachStore()
  const [showInteractionForm, setShowInteractionForm] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [template, setTemplate] = useState('')

  function openTemplate() {
    setTemplate(getMessageTemplate(contact))
    setShowTemplate(true)
  }

  const sortedInteractions = [...contact.interactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{contact.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{contact.role}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          <span className={`badge ${STATUS_CSS[contact.status]}`}>{contact.status}</span>
          <span className={`badge ${TIER_CSS[contact.tier]}`}>Tier {contact.tier}</span>
          {contact.genre && <span className="badge badge-todo">{contact.genre}</span>}
          {contact.followers && (
            <span className="badge badge-todo">{contact.followers.toLocaleString('fr-FR')} followers</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {contact.platform && <div><label>Plateforme</label><div style={{ fontSize: 13 }}>{contact.platform}</div></div>}
          {contact.lastContact && <div><label>Dernier contact</label><div style={{ fontSize: 13 }}>{formatDateFR(contact.lastContact)}</div></div>}
          {contact.email && <div><label>Email</label><div style={{ fontSize: 13 }}><a href={`mailto:${contact.email}`} style={{ color: 'var(--dark)' }}>{contact.email}</a></div></div>}
          {contact.instagram && <div><label>Instagram</label><div style={{ fontSize: 13 }}>{contact.instagram}</div></div>}
        </div>

        {contact.profileUrl && (
          <a href={contact.profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: 16, display: 'inline-flex' }}>
            <ExternalLink size={12} /> Voir profil
          </a>
        )}

        {contact.notes && (
          <div style={{ marginBottom: 16 }}>
            <label>Notes</label>
            <p style={{ fontSize: 13, color: 'var(--mid)', whiteSpace: 'pre-wrap' }}>{contact.notes}</p>
          </div>
        )}

        <hr className="divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Interactions ({contact.interactions.length})</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={openTemplate}>
              <MessageSquare size={12} /> Template
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowInteractionForm(true)}>
              <Plus size={12} /> Ajouter
            </button>
          </div>
        </div>

        {sortedInteractions.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 12, fontStyle: 'italic' }}>Aucune interaction enregistrée.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedInteractions.map(i => (
            <div key={i.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="badge badge-todo" style={{ fontSize: 10 }}>{i.type}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{formatDateFR(i.date)}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '1px 4px' }} onClick={() => deleteInteraction(contact.id, i.id)}>
                  <Trash2 size={11} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--mid)', marginBottom: i.outcome ? 4 : 0 }}>{i.summary}</p>
              {i.outcome && <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>{i.outcome}</p>}
            </div>
          ))}
        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>Éditer</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={12} /> Supprimer</button>
        </div>
      </div>

      {showInteractionForm && (
        <InteractionForm
          onSave={i => addInteraction(contact.id, i)}
          onClose={() => setShowInteractionForm(false)}
        />
      )}

      {showTemplate && (
        <div className="modal-overlay" onClick={() => setShowTemplate(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Template de message — {contact.role}</div>
            <div className="form-group">
              <label>Message (personnalisez avant d'envoyer)</label>
              <textarea
                rows={14}
                value={template}
                onChange={e => setTemplate(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={() => setShowTemplate(false)}>Fermer</button>
              <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(template); alert('Copié !') }}>
                Copier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Outreach() {
  const { contacts, addContact, updateContact, deleteContact } = useOutreachStore()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [sortKey, setSortKey] = useState<keyof Contact>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = useMemo(() => {
    return contacts
      .filter(c => filterRole === 'all' || c.role === filterRole)
      .filter(c => filterTier === 'all' || c.tier === filterTier)
      .filter(c => filterStatus === 'all' || c.status === filterStatus)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.notes.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '')
        const bv = String(b[sortKey] ?? '')
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
  }, [contacts, filterRole, filterTier, filterStatus, search, sortKey, sortAsc])

  function handleSort(key: keyof Contact) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Outreach & Contacts</div>
          <div className="section-subtitle">{contacts.length} contacts · {contacts.filter(c => c.status === 'partenaire').length} partenaires</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Ajouter contact
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Recherche</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nom, notes..."
          />
        </div>
        <div className="form-group" style={{ flex: 0, minWidth: 150 }}>
          <label>Rôle</label>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="all">Tous les rôles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 0, minWidth: 100 }}>
          <label>Tier</label>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)}>
            <option value="all">Tous</option>
            {TIERS.map(t => <option key={t} value={t}>Tier {t}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 0, minWidth: 140 }}>
          <label>Statut</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tous</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              {([
                ['name', 'Nom'], ['role', 'Rôle'], ['tier', 'Tier'],
                ['status', 'Statut'], ['followers', 'Audience'], ['lastContact', 'Dernier contact'],
              ] as [keyof Contact, string][]).map(([k, l]) => (
                <th key={k} onClick={() => handleSort(k)}>
                  {l} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              ))}
              <th>Interactions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)}>
                <td><strong>{c.name}</strong></td>
                <td><span className="badge badge-todo" style={{ fontSize: 10 }}>{c.role}</span></td>
                <td><span className={`badge ${TIER_CSS[c.tier]}`}>Tier {c.tier}</span></td>
                <td><span className={`badge ${STATUS_CSS[c.status]}`}>{c.status}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--mid)' }}>
                  {c.followers ? c.followers.toLocaleString('fr-FR') : '—'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--mid)' }}>
                  {c.lastContact ? formatDateFR(c.lastContact) : '—'}
                </td>
                <td>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: c.interactions.length > 0 ? 'var(--dark)' : 'var(--muted)' }}>
                    {c.interactions.length}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state"><p>Aucun contact correspondant.</p></div>
        )}
      </div>

      {selected && (
        <ContactDrawer
          contact={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null) }}
          onDelete={() => { deleteContact(selected.id); setSelected(null) }}
        />
      )}
      {showAdd && (
        <ContactForm onSave={addContact} onClose={() => setShowAdd(false)} />
      )}
      {editing && (
        <ContactForm
          initial={editing}
          onSave={updates => { updateContact(editing.id, updates); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
