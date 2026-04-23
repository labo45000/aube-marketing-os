import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAnalyticsStore } from '../../store/useAnalyticsStore'
import type { PlatformSnapshot } from '../../types'
import { formatDateFR } from '../../utils/storage'

const PLATFORMS = ['Instagram', 'SoundCloud', 'YouTube', 'Spotify']
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  SoundCloud: '#FF5500',
  YouTube: '#FF0000',
  Spotify: '#1DB954',
}

function MetricCard({ platform, snapshots }: { platform: string; snapshots: PlatformSnapshot[] }) {
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]
  const prev = sorted[1]

  if (!latest) return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORM_COLORS[platform] || '#8A8880', display: 'inline-block' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{platform}</span>
      </div>
      <div style={{ color: 'var(--muted)', fontSize: 12 }}>Aucune donnée</div>
    </div>
  )

  const delta = prev ? latest.followers - prev.followers : null
  const deltaSign = delta !== null && delta > 0 ? '+' : ''

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORM_COLORS[platform] || '#8A8880', display: 'inline-block' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{platform}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{latest.followers.toLocaleString('fr-FR')}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>followers</div>
      {delta !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          {delta > 0 ? <TrendingUp size={13} color="var(--green)" /> : delta < 0 ? <TrendingDown size={13} color="var(--red)" /> : <Minus size={13} color="var(--muted)" />}
          <span style={{ color: delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--muted)' }}>
            {deltaSign}{delta} vs snapshot précédent
          </span>
        </div>
      )}
      {(latest.streams !== undefined) && (
        <div style={{ fontSize: 12, color: 'var(--mid)' }}>
          {latest.streams.toLocaleString('fr-FR')} <span style={{ color: 'var(--muted)' }}>streams</span>
        </div>
      )}
      {(latest.views !== undefined) && (
        <div style={{ fontSize: 12, color: 'var(--mid)' }}>
          {latest.views.toLocaleString('fr-FR')} <span style={{ color: 'var(--muted)' }}>vues</span>
        </div>
      )}
      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
        Mis à jour le {formatDateFR(latest.date)}
      </div>
    </div>
  )
}

function SnapshotForm({ onSave, onClose }: {
  onSave: (s: Omit<PlatformSnapshot, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<PlatformSnapshot, 'id'>>({
    platform: 'Instagram',
    date: new Date().toISOString().split('T')[0],
    followers: 0,
  })

  function num(val: string) { return val === '' ? undefined : Number(val) }

  function submit() {
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Ajouter un snapshot</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Plateforme</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Followers *</label>
              <input type="number" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Streams / Plays</label>
              <input type="number" value={form.streams ?? ''} onChange={e => setForm(f => ({ ...f, streams: num(e.target.value) }))} />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label>Vues</label>
              <input type="number" value={form.views ?? ''} onChange={e => setForm(f => ({ ...f, views: num(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Likes</label>
              <input type="number" value={form.likes ?? ''} onChange={e => setForm(f => ({ ...f, likes: num(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Saves</label>
              <input type="number" value={form.saves ?? ''} onChange={e => setForm(f => ({ ...f, saves: num(e.target.value) }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Portée (Reach)</label>
            <input type="number" value={form.reach ?? ''} onChange={e => setForm(f => ({ ...f, reach: num(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={submit}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { snapshots, addSnapshot, deleteSnapshot } = useAnalyticsStore()
  const [showAdd, setShowAdd] = useState(false)
  const [hiddenPlatforms, setHiddenPlatforms] = useState<Set<string>>(new Set())

  function togglePlatform(platform: string) {
    setHiddenPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(platform)) next.delete(platform)
      else next.add(platform)
      return next
    })
  }

  // Build chart data: one entry per unique date, one key per platform
  const allDates = [...new Set(snapshots.map(s => s.date))].sort()
  const chartData = allDates.map(date => {
    const entry: Record<string, string | number> = { date }
    for (const platform of PLATFORMS) {
      const snap = snapshots.find(s => s.date === date && s.platform === platform)
      if (snap) entry[platform] = snap.followers
    }
    return entry
  })

  const sortedSnapshots = [...snapshots].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Analytics</div>
          <div className="section-subtitle">Saisie manuelle des métriques</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Ajouter snapshot
        </button>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {PLATFORMS.map(p => (
          <MetricCard key={p} platform={p} snapshots={snapshots.filter(s => s.platform === p)} />
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Évolution des followers</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  className="btn btn-sm"
                  style={{
                    background: hiddenPlatforms.has(p) ? 'var(--surface-alt)' : PLATFORM_COLORS[p] + '22',
                    color: hiddenPlatforms.has(p) ? 'var(--muted)' : PLATFORM_COLORS[p],
                    borderColor: hiddenPlatforms.has(p) ? 'var(--border)' : PLATFORM_COLORS[p] + '44',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                  }}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {PLATFORMS.filter(p => !hiddenPlatforms.has(p)).map(p => (
                <Line
                  key={p}
                  type="monotone"
                  dataKey={p}
                  stroke={PLATFORM_COLORS[p]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: PLATFORM_COLORS[p] }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontWeight: 600, fontSize: 14 }}>
          Historique des snapshots
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Plateforme</th>
              <th>Date</th>
              <th>Followers</th>
              <th>Streams / Vues</th>
              <th>Likes</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedSnapshots.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORM_COLORS[s.platform] || '#8A8880', display: 'inline-block', flexShrink: 0 }} />
                    {s.platform}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{formatDateFR(s.date)}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{s.followers.toLocaleString('fr-FR')}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--mid)' }}>
                  {s.streams !== undefined ? `${s.streams.toLocaleString('fr-FR')} str.` : s.views !== undefined ? `${s.views.toLocaleString('fr-FR')} vues` : '—'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--mid)' }}>{s.likes ?? '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--mid)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes || '—'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteSnapshot(s.id)}>
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {snapshots.length === 0 && (
          <div className="empty-state"><p>Aucun snapshot. Ajoutez vos premières métriques.</p></div>
        )}
      </div>

      {showAdd && <SnapshotForm onSave={addSnapshot} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
