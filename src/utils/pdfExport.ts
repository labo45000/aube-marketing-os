import jsPDF from 'jspdf'

function getStoreData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function exportGlobalPDF() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 20
  const contentW = pageW - margin * 2
  let y = margin

  function addLine(text: string, size = 10, bold = false, color = '#1A1916') {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const rgb = hexToRgb(color)
    doc.setTextColor(rgb[0], rgb[1], rgb[2])
    const lines = doc.splitTextToSize(text, contentW)
    if (y + lines.length * (size * 0.4) > 280) {
      doc.addPage()
      y = margin
    }
    doc.text(lines, margin, y)
    y += lines.length * (size * 0.4) + 2
  }

  function addSpacer(h = 6) { y += h }

  function addDivider() {
    doc.setDrawColor(200, 195, 184)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  // Header
  doc.setFillColor(26, 25, 22)
  doc.rect(0, 0, pageW, 30, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(250, 250, 247)
  doc.text('∆ÜBE', margin, 19)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(138, 136, 128)
  doc.text('Marketing OS — Rapport de synthèse', margin + 28, 19)
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text(dateStr, pageW - margin, 19, { align: 'right' })
  y = 40

  // Artist profile
  const profile = getStoreData<{ artistName: string; location: string; genres: string[]; bpmRange: string; bioShortFR: string }>('dube_assets')
  if (profile) {
    addLine('Profil Artiste', 13, true)
    addSpacer(2)
    addLine(`${profile.artistName} — ${profile.location}`, 10)
    addLine(`Genres : ${profile.genres?.join(', ')} | BPM : ${profile.bpmRange}`, 10)
    if (profile.bioShortFR) {
      addSpacer(3)
      addLine(profile.bioShortFR, 9, false, '#3A3835')
    }
    addDivider()
  }

  // Roadmap
  const milestones = getStoreData<Array<{ year: string; title: string; status: string }>>('dube_roadmap')
  if (milestones?.length) {
    addLine('Roadmap artistique', 13, true)
    addSpacer(2)
    for (const m of milestones) {
      const statusLabel = m.status === 'done' ? '✓ Complété' : m.status === 'progress' ? '→ En cours' : '○ À venir'
      addLine(`${m.year} — ${m.title}  [${statusLabel}]`, 9)
    }
    addDivider()
  }

  // Releases
  const releases = getStoreData<Array<{ title: string; type: string; status: string; genre: string; bpm?: number }>>('dube_releases')
  if (releases?.length) {
    addLine('Releases', 13, true)
    addSpacer(2)
    for (const r of releases) {
      addLine(`${r.title} — ${r.type} — ${r.genre}${r.bpm ? ` — ${r.bpm} BPM` : ''} [${r.status}]`, 9)
    }
    addDivider()
  }

  // Analytics snapshot
  const snapshots = getStoreData<Array<{ platform: string; date: string; followers: number; streams?: number; views?: number }>>('dube_analytics')
  if (snapshots?.length) {
    addLine('Analytics (dernier snapshot)', 13, true)
    addSpacer(2)
    const platforms = [...new Set(snapshots.map(s => s.platform))]
    for (const platform of platforms) {
      const latest = snapshots
        .filter(s => s.platform === platform)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
      if (!latest) continue
      const extra = latest.streams ? ` | ${latest.streams} streams` : latest.views ? ` | ${latest.views} vues` : ''
      addLine(`${platform} : ${latest.followers} followers${extra}`, 9)
    }
    addDivider()
  }

  // Active checklists
  const checklists = getStoreData<Array<{ name: string; items: Array<{ done: boolean }> }>>('dube_checklists')
  if (checklists?.length) {
    const active = checklists.filter(c => !('archived' in c && c['archived' as keyof typeof c]))
    if (active.length) {
      addLine('Checklists actives', 13, true)
      addSpacer(2)
      for (const c of active) {
        const done = c.items.filter(i => i.done).length
        addLine(`${c.name} — ${done}/${c.items.length} complétés`, 9)
      }
      addDivider()
    }
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(138, 136, 128)
  doc.text(`∆ÜBE Marketing OS — Généré le ${dateStr}`, pageW / 2, 290, { align: 'center' })

  doc.save(`dube-marketing-rapport-${new Date().toISOString().split('T')[0]}.pdf`)
}
