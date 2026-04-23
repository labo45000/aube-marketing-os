import { create } from 'zustand'
import type { PlatformSnapshot } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedSnapshots } from '../data/seed'

interface AnalyticsStore {
  snapshots: PlatformSnapshot[]
  addSnapshot: (s: Omit<PlatformSnapshot, 'id'>) => void
  updateSnapshot: (id: string, updates: Partial<PlatformSnapshot>) => void
  deleteSnapshot: (id: string) => void
}

const KEY = 'dube_analytics'

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  snapshots: loadFromStorage<PlatformSnapshot[]>(KEY, seedSnapshots),

  addSnapshot: (s) => {
    const next = [...get().snapshots, { ...s, id: genId() }]
    set({ snapshots: next })
    saveToStorage(KEY, next)
  },

  updateSnapshot: (id, updates) => {
    const next = get().snapshots.map(s => s.id === id ? { ...s, ...updates } : s)
    set({ snapshots: next })
    saveToStorage(KEY, next)
  },

  deleteSnapshot: (id) => {
    const next = get().snapshots.filter(s => s.id !== id)
    set({ snapshots: next })
    saveToStorage(KEY, next)
  },
}))
