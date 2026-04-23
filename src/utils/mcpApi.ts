const MCP_BASE = 'http://localhost:3721'

let lastKnownVersion = 0

export interface AgentEvent {
  id: string
  type: 'agent_action'
  tool: string
  summary: string
  timestamp: string
  success: boolean
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 3000): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function checkMcpHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${MCP_BASE}/api/health`, {}, 2000)
    return res.ok
  } catch {
    return false
  }
}

export async function fetchMcpState(): Promise<{ data: Record<string, unknown>; version: number } | null> {
  try {
    const res = await fetchWithTimeout(`${MCP_BASE}/api/state`)
    if (!res.ok) return null
    const json = await res.json() as { version: number } & Record<string, unknown>
    lastKnownVersion = json.version
    return { data: json, version: json.version }
  } catch {
    return null
  }
}

export async function fetchMcpStateIfChanged(): Promise<{ data: Record<string, unknown>; version: number } | null> {
  try {
    const res = await fetchWithTimeout(`${MCP_BASE}/api/state`)
    if (!res.ok) return null
    const json = await res.json() as { version: number } & Record<string, unknown>
    if (json.version === lastKnownVersion) return null
    lastKnownVersion = json.version
    return { data: json, version: json.version }
  } catch {
    return null
  }
}

export async function pushModuleToMcp(module: string, data: unknown): Promise<void> {
  try {
    await fetchWithTimeout(`${MCP_BASE}/api/state/${module}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, 2000)
  } catch {
    // non-fatal — localStorage reste la source de vérité locale
  }
}

export function subscribeToMcpEvents(onEvent: (e: AgentEvent) => void, onConnect: () => void, onDisconnect: () => void): () => void {
  let es: EventSource | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let alive = true

  function connect() {
    if (!alive) return
    es = new EventSource(`${MCP_BASE}/api/events`)
    es.onopen = () => onConnect()
    es.onerror = () => {
      onDisconnect()
      es?.close()
      if (alive) reconnectTimer = setTimeout(connect, 5000)
    }
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data as string) as AgentEvent & { type: string }
        if (parsed.type === 'agent_action') onEvent(parsed)
      } catch { /* ignore */ }
    }
  }

  connect()

  return () => {
    alive = false
    if (reconnectTimer) clearTimeout(reconnectTimer)
    es?.close()
  }
}
