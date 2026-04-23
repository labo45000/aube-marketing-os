import { useState } from 'react'
import { Plus, Trash2, Copy, Download, ExternalLink } from 'lucide-react'
import jsPDF from 'jspdf'
import { useAssetsStore } from '../../store/useAssetsStore'
import { useAnalyticsStore } from '../../store/useAnalyticsStore'
import { useReleasesStore } from '../../store/useReleasesStore'
import type { ArtistLink, VisualAsset } from '../../types'

const TABS = ['Bio', 'Liens', 'Visuels', 'EPK'] as const
type Tab = typeof TABS[number]

function BioSection() {
  const { profile, updateProfile } = useAssetsStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {([
        ['bioShortFR', 'Bio courte FR', 150],
        ['bioLongFR', 'Bio longue FR (presse / booking)', 800],
        ['bioShortEN', 'Bio courte EN', 150],
        ['bioLongEN', 'Bio longue EN', 800],
        ['pitchOral', 'Pitch oral 30 secondes', 200],
      ] as [keyof typeof profile, string, number][]).map(([key, label, max]) => {
        const val = profile[key] as string
        return (
          <div key={key} className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ margin: 0 }}>{label}</label>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: val.length > max ? 'var(--red)' : 'var(--muted)' }}>
                {val.length}/{max}
              </span>
            </div>
            <textarea
              rows={key.includes('Long') ? 6 : 3}
              value={val}
              onChange={e => updateProfile({ [key]: e.target.value })}
              placeholder={`${label}...`}
            />
          </div>
        )
      })}
    </div>
  )
}

function LinksSection() {
  const { profile, updateProfile } = useAssetsStore()
  const [newLink, setNewLink] = useState<Partial<ArtistLink>>({ platform: '', url: '', handle: '', verified: false })
  const [showAdd, setShowAdd] = useState(false)

  function addLink() {
    if (!newLink.platform || !newLink.url) return
    updateProfile({ links: [...profile.links, newLink as ArtistLink] })
    setNewLink({ platform: '', url: '', handle: '', verified: false })
    setShowAdd(false)
  }

  function removeLink(idx: number) {
    updateProfile({ links: profile.links.filter((_, i) => i !== idx) })
  }

  function updateLink(idx: number, updates: Partial<ArtistLink>) {
    updateProfile({ links: profile.links.map((l, i) => i === idx ? { ...l, ...updates } : l) })
  }

  return (
    <div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Plateforme</th>
              <th>Handle</th>
              <th>URL</th>
              <th>Vérifié</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profile.links.map((link, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{link.platform}</td>
                <td>
                  <input
                    value={link.handle}
                    onChange={e => updateLink(i, { handle: e.target.value })}
                    style={{ width: 120, fontSize: 12 }}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      value={link.url}
                      onChange={e => updateLink(i, { url: e.target.value })}
                      placeholder="https://..."
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    {link.url && (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(link.url)}>
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={link.verified}
                    onChange={e => updateLink(i, { verified: e.target.checked })}
                    style={{ width: 16 }}
                  />
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => removeLink(i)}>
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {profile.links.length === 0 && (
          <div className="empty-state" style={{ padding: 24 }}><p>Aucun lien enregistré.</p></div>
        )}
      </div>
      {showAdd ? (
        <div className="card">
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
            <div className="form-group">
              <label>Plateforme</label>
              <input value={newLink.platform} onChange={e => setNewLink(l => ({ ...l, platform: e.target.value }))} placeholder="SoundCloud" />
            </div>
            <div className="form-group">
              <label>Handle</label>
              <input value={newLink.handle} onChange={e => setNewLink(l => ({ ...l, handle: e.target.value }))} placeholder="@handle" />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input value={newLink.url} onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={addLink}>Ajouter</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Annuler</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={12} /> Ajouter un lien
        </button>
      )}
    </div>
  )
}

function VisuelsSection() {
  const { profile, addVisualAsset, updateVisualAsset, deleteVisualAsset } = useAssetsStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newAsset, setNewAsset] = useState<Omit<VisualAsset, 'id'>>({ label: '', category: 'Logo', date: new Date().toISOString().split('T')[0] })

  const CATEGORIES = ['Logo', 'Photo', 'Artwork', 'Bannière', 'Autre']

  function addAsset() {
    if (!newAsset.label) return
    addVisualAsset(newAsset)
    setNewAsset({ label: '', category: 'Logo', date: new Date().toISOString().split('T')[0] })
    setShowAdd(false)
  }

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = profile.visualAssets.filter(a => a.category === cat)
    return acc
  }, {} as Record<string, VisualAsset[]>)

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {CATEGORIES.filter(cat => byCategory[cat].length > 0 || cat === 'Logo').map(cat => (
          <div key={cat}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {cat}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {byCategory[cat].map(asset => (
                <div key={asset.id} className="card" style={{ padding: 12 }}>
                  {asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.label}
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: 80, background: 'var(--surface-alt)', borderRadius: 4, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>
                      Pas d'aperçu
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{asset.label}</div>
                  <input
                    value={asset.url || ''}
                    onChange={e => updateVisualAsset(asset.id, { url: e.target.value })}
                    placeholder="URL de l'asset..."
                    style={{ fontSize: 11, marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    {asset.url && (
                      <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(asset.url || '')}>
                        <Copy size={11} /> URL
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteVisualAsset(asset.id)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {showAdd ? (
          <div className="card">
            <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 2fr', gap: 10 }}>
              <div className="form-group">
                <label>Label</label>
                <input value={newAsset.label} onChange={e => setNewAsset(a => ({ ...a, label: e.target.value }))} placeholder="Nom de l'asset" />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select value={newAsset.category} onChange={e => setNewAsset(a => ({ ...a, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>URL (optionnel)</label>
                <input value={newAsset.url || ''} onChange={e => setNewAsset(a => ({ ...a, url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={addAsset}>Ajouter</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Annuler</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={12} /> Ajouter un asset
          </button>
        )}
      </div>
    </div>
  )
}

function EPKSection() {
  const { profile, updateProfile } = useAssetsStore()
  const { snapshots } = useAnalyticsStore()
  const { releases } = useReleasesStore()

  function generateEPK() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = 210
    const margin = 20
    const contentW = pageW - margin * 2
    let y = margin

    function hex(h: string): [number, number, number] {
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
    }

    function text(str: string, size = 10, bold = false, color = '#1A1916') {
      doc.setFontSize(size)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      const [r, g, b] = hex(color)
      doc.setTextColor(r, g, b)
      const lines = doc.splitTextToSize(str, contentW)
      if (y + lines.length * size * 0.4 > 282) { doc.addPage(); y = margin }
      doc.text(lines, margin, y)
      y += lines.length * size * 0.4 + 2
    }

    function space(h = 5) { y += h }

    function line() {
      doc.setDrawColor(200, 195, 184)
      doc.line(margin, y, pageW - margin, y)
      y += 5
    }

    // Header block
    doc.setFillColor(26, 25, 22)
    doc.rect(0, 0, pageW, 36, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(250, 250, 247)
    doc.text('∆ÜBE', margin, 22)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(138, 136, 128)
    doc.text('Electronic Press Kit', margin, 30)
    const d = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    doc.text(d, pageW - margin, 30, { align: 'right' })
    y = 46

    // Artist info
    text(`${profile.artistName}  |  ${profile.location}`, 14, true)
    space(2)
    text(`Genres : ${profile.genres.join(', ')}  |  BPM : ${profile.bpmRange}  |  DAW : ${profile.daw}`, 10, false, '#3A3835')
    text(`Influences : ${profile.influences.join(', ')}`, 9, false, '#8A8880')
    space(3)
    line()

    // Bio
    text('Biographie', 12, true)
    space(2)
    if (profile.bioLongFR) {
      text(profile.bioLongFR, 10, false, '#3A3835')
    } else if (profile.bioShortFR) {
      text(profile.bioShortFR, 10, false, '#3A3835')
    } else {
      text('Biographie non renseignée.', 10, false, '#8A8880')
    }
    space(3)
    line()

    // Releases
    const liveReleases = releases.filter(r => r.status === 'live' || r.status === 'mastered' || r.status === 'submitted')
    if (liveReleases.length > 0) {
      text('Releases', 12, true)
      space(2)
      for (const r of liveReleases) {
        text(`• ${r.title}  [${r.type}]  ${r.genre}${r.bpm ? `  ${r.bpm} BPM` : ''}`, 9, false, '#3A3835')
      }
      space(3)
      line()
    }

    // Stats
    const platforms = [...new Set(snapshots.map(s => s.platform))]
    if (platforms.length > 0) {
      text('Streaming & Réseaux sociaux', 12, true)
      space(2)
      for (const platform of platforms) {
        const latest = snapshots.filter(s => s.platform === platform).sort((a, b) => b.date.localeCompare(a.date))[0]
        if (!latest) continue
        const extra = latest.streams !== undefined ? ` | ${latest.streams.toLocaleString('fr-FR')} streams` : latest.views !== undefined ? ` | ${latest.views.toLocaleString('fr-FR')} vues` : ''
        text(`• ${platform} : ${latest.followers.toLocaleString('fr-FR')} followers${extra}`, 9, false, '#3A3835')
      }
      space(3)
      line()
    }

    // Gear
    if (profile.gear.length > 0) {
      text('Setup technique', 12, true)
      space(2)
      text(profile.gear.join('  |  '), 9, false, '#3A3835')
      space(3)
      line()
    }

    // Venues
    if (profile.venuePlayed.length > 0) {
      text('Scènes', 12, true)
      space(2)
      profile.venuePlayed.forEach(v => text(`• ${v}`, 9, false, '#3A3835'))
      space(3)
      line()
    }

    // Links
    const hasLinks = profile.links.some(l => l.url)
    if (hasLinks) {
      text('Liens', 12, true)
      space(2)
      profile.links.filter(l => l.url).forEach(l => text(`${l.platform} : ${l.url}`, 9, false, '#3A3835'))
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(138, 136, 128)
    doc.text(`∆ÜBE EPK — Généré le ${d}`, pageW / 2, 290, { align: 'center' })

    doc.save(`dube-epk-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Electronic Press Kit (EPK)</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Compilation automatique des données de l'artiste en PDF A4
            </div>
          </div>
          <button className="btn btn-primary" onClick={generateEPK}>
            <Download size={14} /> Générer EPK PDF
          </button>
        </div>
        <hr className="divider" />
        <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.8 }}>
          <p>Le PDF inclut :</p>
          <ul style={{ paddingLeft: 20, marginTop: 4 }}>
            <li>Nom artiste, genres, BPM range, DAW, influences</li>
            <li>Biographie longue FR (ou courte si non renseignée)</li>
            <li>Releases (mastered, submitted, live)</li>
            <li>Dernières statistiques par plateforme</li>
            <li>Setup technique et scènes jouées</li>
            <li>Liens officiels</li>
          </ul>
          <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 12 }}>
            Pour enrichir l'EPK, complétez la bio longue FR et les stats analytics.
          </p>
        </div>
      </div>

      {/* Profile fields for EPK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {([
          ['genres', 'Genres'], ['bpmRange', 'BPM Range'], ['location', 'Localisation'],
          ['daw', 'DAW'], ['founded', 'Fondé en'],
        ] as [keyof typeof profile, string][]).map(([key, label]) => {
          const val = profile[key]
          const strVal = Array.isArray(val) ? val.join(', ') : String(val)
          return (
            <div key={key} className="form-group">
              <label>{label}</label>
              <input
                value={strVal}
                onChange={e => {
                  const isArray = Array.isArray(profile[key])
                  updateProfile({ [key]: isArray ? e.target.value.split(',').map(s => s.trim()) : e.target.value } as Parameters<typeof updateProfile>[0])
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label>Influences (séparées par des virgules)</label>
        <input
          value={profile.influences.join(', ')}
          onChange={e => updateProfile({ influences: e.target.value.split(',').map(s => s.trim()) })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label>Matériel (séparé par des virgules)</label>
        <input
          value={profile.gear.join(', ')}
          onChange={e => updateProfile({ gear: e.target.value.split(',').map(s => s.trim()) })}
        />
      </div>
      <div className="form-group">
        <label>Scènes jouées (une par ligne)</label>
        <textarea
          rows={3}
          value={profile.venuePlayed.join('\n')}
          onChange={e => updateProfile({ venuePlayed: e.target.value.split('\n').filter(Boolean) })}
        />
      </div>
    </div>
  )
}

export default function Assets() {
  const [tab, setTab] = useState<Tab>('Bio')
  const { profile } = useAssetsStore()

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Assets & Bio</div>
          <div className="section-subtitle">{profile.artistName} — {profile.realName}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--dark)' : 'transparent'}`,
              cursor: 'pointer',
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--dark)' : 'var(--muted)',
              fontSize: 14,
              marginBottom: -1,
              transition: 'color 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Bio' && <BioSection />}
      {tab === 'Liens' && <LinksSection />}
      {tab === 'Visuels' && <VisuelsSection />}
      {tab === 'EPK' && <EPKSection />}
    </div>
  )
}
