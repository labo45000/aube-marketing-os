import { useState } from 'react'
import { Copy, Check, Eye, EyeOff, Wifi, WifiOff, Bot, Zap } from 'lucide-react'
import { useMcpStore } from '../../store/useMcpStore'

const MCP_URL = 'http://100.126.226.118:3721/mcp'
const MCP_KEY = '84ad49cdefe16fd0bb57bd0c85eef4f6a4bddc86a701d97bd651b2c20cdc5863'
const APP_URL = 'https://aube-marketing-os.vercel.app'
const GITHUB_URL = 'https://github.com/labo45000/aube-marketing-os'

const SKILL_CONTENT = `## Artiste
∆ÜBE (Augustin Besse, Paris FR) — DJ/producteur tech house & afro house, lancement carrière 2026.
Objectif 3 ans : festival majeur (Coachella / Tomorrowland).

## Environnement déployé
- Interface : ${APP_URL} (production Vercel)
- MCP Server : ${MCP_URL} (Tailnet — accessible depuis tous les appareils du réseau Tailscale)
- GitHub : ${GITHUB_URL}
- Les données sont synchronisées en temps réel entre le MCP server et l'interface.

## Contexte permanent
- DAW : Logic Pro
- Influences : Keinemusik, &ME, Black Coffee, John Summit, RÜFÜS DU SOL, Fred again.., Francis Mercier
- Release active : remix "Ndokulandela" (Bongeziwe Mabandla feat. ∆ÜBE) — statut mastered
- Contact clé : Bongeziwe Mabandla (artiste sud-africain, accord remix en cours via Instagram)
- Venues jouées : La Cabane Bambou, Saint-Tropez (2025)
- BPM range : 120–130

## Règles d'usage
- Commence TOUJOURS par appeler \`get_artist_context\` avant toute séquence d'actions
- Les modifications via MCP sont immédiatement visibles sur ${APP_URL}
- Pour les actions d'outreach (messages, emails), génère via \`generate_outreach_message\` mais n'envoie JAMAIS rien — présente le texte à l'utilisateur pour validation
- Pour les modifications de bio, propose le texte et demande confirmation avant \`update_bio\`
- Utilise \`create_checklist_from_template\` quand une nouvelle release démarre
- Ajoute un snapshot analytics via \`add_analytics_snapshot\` chaque semaine si demandé
- Après \`log_interaction\`, appelle \`update_contact_status\` si le statut a changé

## Modules & outils disponibles
| Module | Outils |
|--------|--------|
| Contexte | get_artist_context, get_full_state |
| Roadmap | list_milestones, update_milestone_status, check_milestone_item, add_milestone |
| Releases | list_releases, get_release, update_release, add_release |
| Contenu | list_content, add_content, update_content_status, suggest_content_plan |
| Analytics | get_analytics_summary, add_analytics_snapshot, get_growth_trend |
| Workflow | list_checklists, get_checklist, check_item, create_checklist_from_template, add_checklist_item |
| Outreach | list_contacts, get_contact, add_contact, update_contact_status, log_interaction, generate_outreach_message |
| Assets | get_bios, update_bio, get_links, update_link |`

const WORKFLOWS: Record<string, { label: string; prompt: string }> = {
  general: {
    label: 'Général',
    prompt: `Tu es un assistant marketing connecté au ∆ÜBE Marketing OS (${APP_URL}).
Tu interagis avec le système via le MCP server — tes actions sont immédiatement reflétées sur l'interface de production.

## Connexion MCP
- URL : ${MCP_URL}
- Transport : HTTP Streamable
- Header : Authorization: Bearer ${MCP_KEY}

${SKILL_CONTENT}

Attends les instructions de l'utilisateur et commence chaque session par \`get_artist_context\`.`,
  },
  release: {
    label: 'Préparer une release',
    prompt: `Tu es un assistant marketing connecté au ∆ÜBE Marketing OS (${APP_URL}).
Tu interagis avec le système via le MCP server — tes actions sont immédiatement reflétées sur l'interface de production.

## Connexion MCP
- URL : ${MCP_URL}
- Transport : HTTP Streamable
- Header : Authorization: Bearer ${MCP_KEY}

${SKILL_CONTENT}

## Workflow à exécuter : Préparer une release

1. \`get_artist_context\` — obtenir l'état complet
2. \`list_releases\` (status: wip) — identifier la release en cours
3. \`create_checklist_from_template\` (type: pre-release, releaseId) — créer la checklist
4. \`suggest_content_plan\` — plan éditorial 28 jours autour de la sortie
5. \`list_contacts\` (role: Playlist curator, tier: A) — identifier les cibles outreach
6. Pour chaque contact tier A : \`generate_outreach_message\` → présenter à l'utilisateur

Exécute ce workflow maintenant.`,
  },
  weekly: {
    label: 'Rapport hebdomadaire',
    prompt: `Tu es un assistant marketing connecté au ∆ÜBE Marketing OS (${APP_URL}).
Tu interagis avec le système via le MCP server — tes actions sont immédiatement reflétées sur l'interface de production.

## Connexion MCP
- URL : ${MCP_URL}
- Transport : HTTP Streamable
- Header : Authorization: Bearer ${MCP_KEY}

${SKILL_CONTENT}

## Workflow à exécuter : Rapport hebdomadaire

1. \`get_analytics_summary\` — métriques globales
2. \`get_growth_trend\` (platform: Instagram, days: 7) + \`get_growth_trend\` (platform: SoundCloud, days: 7)
3. \`list_checklists\` — checklists actives et leur avancement
4. \`list_content\` (from: aujourd'hui, to: +7 jours) — contenu prévu cette semaine
5. Synthétiser et présenter un rapport structuré avec : croissance, actions en cours, agenda contenu

Exécute ce workflow maintenant et présente un rapport complet.`,
  },
  outreach: {
    label: 'Outreach playlist',
    prompt: `Tu es un assistant marketing connecté au ∆ÜBE Marketing OS (${APP_URL}).
Tu interagis avec le système via le MCP server — tes actions sont immédiatement reflétées sur l'interface de production.

## Connexion MCP
- URL : ${MCP_URL}
- Transport : HTTP Streamable
- Header : Authorization: Bearer ${MCP_KEY}

${SKILL_CONTENT}

## Workflow à exécuter : Outreach playlist curators

1. \`get_artist_context\` — contexte et dernière release
2. \`list_contacts\` (role: Playlist curator, status: à contacter) — identifier les cibles
3. Pour chaque contact tier A et B : \`generate_outreach_message\` adapté à leur rôle
4. Présenter TOUS les messages dans une réponse unique pour validation
5. Attendre la confirmation de l'utilisateur avant tout \`log_interaction\`

Après envoi confirmé par l'utilisateur seulement :
- \`log_interaction\` pour chaque contact
- \`update_contact_status\` → "contacté"

Exécute les étapes 1 à 4 maintenant.`,
  },
  analytics: {
    label: 'Mise à jour analytics',
    prompt: `Tu es un assistant marketing connecté au ∆ÜBE Marketing OS (${APP_URL}).
Tu interagis avec le système via le MCP server — tes actions sont immédiatement reflétées sur l'interface de production.

## Connexion MCP
- URL : ${MCP_URL}
- Transport : HTTP Streamable
- Header : Authorization: Bearer ${MCP_KEY}

${SKILL_CONTENT}

## Workflow à exécuter : Mise à jour analytics

1. \`get_analytics_summary\` — voir les derniers chiffres enregistrés
2. Demander à l'utilisateur les nouveaux chiffres pour chaque plateforme (Instagram, SoundCloud, YouTube, Spotify)
3. \`add_analytics_snapshot\` pour chaque plateforme avec les nouveaux chiffres
4. \`get_growth_trend\` pour chaque plateforme (7 jours)
5. Présenter le bilan de croissance comparatif

Commence par l'étape 1, puis demande les nouveaux chiffres.`,
  },
}

function CopyButton({ text, size = 'normal' }: { text: string; size?: 'normal' | 'small' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: copied ? '#1A3A1A' : '#2A2825',
        border: `1px solid ${copied ? '#4ADE80' : '#3A3835'}`,
        borderRadius: 6,
        color: copied ? '#4ADE80' : '#FAFAF7',
        cursor: 'pointer',
        padding: size === 'small' ? '4px 10px' : '7px 14px',
        fontSize: size === 'small' ? 11 : 12,
        fontFamily: 'var(--font-mono)',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copié !' : 'Copier'}
    </button>
  )
}

export default function Settings() {
  const { connected } = useMcpStore()
  const [showKey, setShowKey] = useState(false)
  const [activeWorkflow, setActiveWorkflow] = useState<keyof typeof WORKFLOWS>('general')

  const maskedKey = MCP_KEY.slice(0, 8) + '•'.repeat(24) + MCP_KEY.slice(-8)

  return (
    <div style={{ maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--fg)', marginBottom: 4 }}>Réglages</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Configuration MCP et prompts agent</p>
      </div>

      {/* MCP Connection */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          {connected
            ? <Wifi size={14} color="#4ADE80" />
            : <WifiOff size={14} color="#6A6865" />}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: 'var(--fg)', letterSpacing: '0.04em' }}>CONNEXION MCP</span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: connected ? '#4ADE80' : '#6A6865',
            background: connected ? '#0F2A1A' : '#1E1D1B',
            border: `1px solid ${connected ? '#1A4A2A' : '#2A2825'}`,
            borderRadius: 4,
            padding: '2px 8px',
          }}>
            {connected ? 'connecté' : 'hors ligne'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="URL" value={MCP_URL} copyable />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clé API</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--fg)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '8px 12px',
                wordBreak: 'break-all',
                lineHeight: 1.5,
              }}>
                {showKey ? MCP_KEY : maskedKey}
              </code>
              <button
                onClick={() => setShowKey(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, flexShrink: 0 }}
                title={showKey ? 'Masquer' : 'Afficher'}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <CopyButton text={MCP_KEY} size="small" />
            </div>
          </div>
          <Field label="Transport" value="HTTP Streamable (port 3721)" />
          <Field label="Header auth" value={`Authorization: Bearer ${showKey ? MCP_KEY : maskedKey}`} copyable={false} />
        </div>
      </div>

      {/* Agent Prompt */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          <Bot size={14} color="#A78BFA" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: 'var(--fg)', letterSpacing: '0.04em' }}>PROMPT AGENT</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>— prêt à coller dans Openclaw ou tout agent MCP</span>
        </div>

        {/* Workflow selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workflow</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(WORKFLOWS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveWorkflow(key as keyof typeof WORKFLOWS)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: `1px solid ${activeWorkflow === key ? '#A78BFA' : 'var(--border)'}`,
                  background: activeWorkflow === key ? '#1E1A2E' : 'var(--bg)',
                  color: activeWorkflow === key ? '#A78BFA' : 'var(--muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {activeWorkflow === key && <Zap size={10} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt preview */}
        <div style={{ position: 'relative' }}>
          <textarea
            readOnly
            value={WORKFLOWS[activeWorkflow].prompt}
            style={{
              width: '100%',
              minHeight: 320,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              lineHeight: 1.65,
              color: '#C8C5BE',
              background: '#111110',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '14px 16px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <CopyButton text={WORKFLOWS[activeWorkflow].prompt} />
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6, margin: 0 }}>
          Colle ce prompt comme <strong style={{ color: '#A78BFA' }}>system prompt</strong> dans Openclaw, puis configure le MCP server avec l'URL et la clé ci-dessus.
          L'agent aura accès aux 32 outils du Marketing OS et suivra les règles d'usage définies.
        </p>
      </div>

      {/* .mcp.json snippet */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: 'var(--fg)', letterSpacing: '0.04em' }}>CONFIG .MCP.JSON</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>— pour Claude Code / clients MCP</span>
        </div>
        <div style={{ position: 'relative' }}>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            lineHeight: 1.65,
            color: '#C8C5BE',
            background: '#111110',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '14px 16px',
            margin: 0,
            overflow: 'auto',
          }}>
{`{
  "mcpServers": {
    "aube-marketing-os": {
      "type": "http",
      "url": "${MCP_URL}",
      "headers": {
        "Authorization": "Bearer ${MCP_KEY}"
      }
    }
  }
}`}
          </pre>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <CopyButton text={`{\n  "mcpServers": {\n    "aube-marketing-os": {\n      "type": "http",\n      "url": "${MCP_URL}",\n      "headers": {\n        "Authorization": "Bearer ${MCP_KEY}"\n      }\n    }\n  }\n}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, copyable = true }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <code style={{
          flex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--fg)',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '8px 12px',
        }}>
          {value}
        </code>
        {copyable && <CopyButton text={value} size="small" />}
      </div>
    </div>
  )
}
