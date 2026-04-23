import { create } from 'zustand'
import type { ArtistProfile, VisualAsset } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedArtistProfile } from '../data/seed'

interface AssetsStore {
  profile: ArtistProfile
  updateProfile: (updates: Partial<ArtistProfile>) => void
  addVisualAsset: (asset: Omit<VisualAsset, 'id'>) => void
  updateVisualAsset: (id: string, updates: Partial<VisualAsset>) => void
  deleteVisualAsset: (id: string) => void
}

const KEY = 'dube_assets'

export const useAssetsStore = create<AssetsStore>((set, get) => ({
  profile: loadFromStorage<ArtistProfile>(KEY, seedArtistProfile),

  updateProfile: (updates) => {
    const next = { ...get().profile, ...updates }
    set({ profile: next })
    saveToStorage(KEY, next)
  },

  addVisualAsset: (asset) => {
    const next = { ...get().profile, visualAssets: [...get().profile.visualAssets, { ...asset, id: genId() }] }
    set({ profile: next })
    saveToStorage(KEY, next)
  },

  updateVisualAsset: (id, updates) => {
    const next = {
      ...get().profile,
      visualAssets: get().profile.visualAssets.map(a => a.id === id ? { ...a, ...updates } : a),
    }
    set({ profile: next })
    saveToStorage(KEY, next)
  },

  deleteVisualAsset: (id) => {
    const next = { ...get().profile, visualAssets: get().profile.visualAssets.filter(a => a.id !== id) }
    set({ profile: next })
    saveToStorage(KEY, next)
  },
}))
