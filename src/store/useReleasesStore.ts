import { create } from 'zustand'
import type { Release } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedReleases } from '../data/seed'

interface ReleasesStore {
  releases: Release[]
  addRelease: (r: Omit<Release, 'id' | 'createdAt'>) => void
  updateRelease: (id: string, updates: Partial<Release>) => void
  deleteRelease: (id: string) => void
}

const KEY = 'dube_releases'

export const useReleasesStore = create<ReleasesStore>((set, get) => ({
  releases: loadFromStorage<Release[]>(KEY, seedReleases),

  addRelease: (r) => {
    const next = [...get().releases, { ...r, id: genId(), createdAt: new Date().toISOString().split('T')[0] }]
    set({ releases: next })
    saveToStorage(KEY, next)
  },

  updateRelease: (id, updates) => {
    const next = get().releases.map(r => r.id === id ? { ...r, ...updates } : r)
    set({ releases: next })
    saveToStorage(KEY, next)
  },

  deleteRelease: (id) => {
    const next = get().releases.filter(r => r.id !== id)
    set({ releases: next })
    saveToStorage(KEY, next)
  },
}))
