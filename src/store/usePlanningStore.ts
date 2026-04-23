import { create } from 'zustand'
import type { ContentItem } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedContentItems } from '../data/seed'

interface PlanningStore {
  items: ContentItem[]
  addItem: (item: Omit<ContentItem, 'id'>) => void
  updateItem: (id: string, updates: Partial<ContentItem>) => void
  deleteItem: (id: string) => void
  duplicateItem: (id: string) => void
}

const KEY = 'dube_planning'

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  items: loadFromStorage<ContentItem[]>(KEY, seedContentItems),

  addItem: (item) => {
    const next = [...get().items, { ...item, id: genId() }]
    set({ items: next })
    saveToStorage(KEY, next)
  },

  updateItem: (id, updates) => {
    const next = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items: next })
    saveToStorage(KEY, next)
  },

  deleteItem: (id) => {
    const next = get().items.filter(i => i.id !== id)
    set({ items: next })
    saveToStorage(KEY, next)
  },

  duplicateItem: (id) => {
    const item = get().items.find(i => i.id === id)
    if (!item) return
    const next = [...get().items, { ...item, id: genId(), status: 'idea' as const }]
    set({ items: next })
    saveToStorage(KEY, next)
  },
}))
