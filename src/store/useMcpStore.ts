import { create } from 'zustand'
import type { AgentEvent } from '../utils/mcpApi'

interface McpStore {
  connected: boolean
  events: AgentEvent[]
  logPanelOpen: boolean
  setConnected: (v: boolean) => void
  addEvent: (e: AgentEvent) => void
  toggleLogPanel: () => void
  clearEvents: () => void
}

export const useMcpStore = create<McpStore>((set) => ({
  connected: false,
  events: [],
  logPanelOpen: false,

  setConnected: (connected) => set({ connected }),

  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 200) })),

  toggleLogPanel: () => set((s) => ({ logPanelOpen: !s.logPanelOpen })),

  clearEvents: () => set({ events: [] }),
}))
