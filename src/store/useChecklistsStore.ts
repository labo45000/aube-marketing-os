import { create } from 'zustand'
import type { Checklist, ChecklistItem } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedChecklists } from '../data/seed'

interface ChecklistsStore {
  checklists: Checklist[]
  addChecklist: (c: Omit<Checklist, 'id' | 'createdAt'>) => void
  updateChecklist: (id: string, updates: Partial<Checklist>) => void
  deleteChecklist: (id: string) => void
  duplicateChecklist: (id: string, name: string) => void
  toggleItem: (checklistId: string, itemId: string) => void
  updateItem: (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => void
  addItem: (checklistId: string, label: string) => void
  removeItem: (checklistId: string, itemId: string) => void
}

const KEY = 'dube_checklists'

export const useChecklistsStore = create<ChecklistsStore>((set, get) => ({
  checklists: loadFromStorage<Checklist[]>(KEY, seedChecklists),

  addChecklist: (c) => {
    const next = [...get().checklists, { ...c, id: genId(), createdAt: new Date().toISOString().split('T')[0] }]
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  updateChecklist: (id, updates) => {
    const next = get().checklists.map(c => c.id === id ? { ...c, ...updates } : c)
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  deleteChecklist: (id) => {
    const next = get().checklists.filter(c => c.id !== id)
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  duplicateChecklist: (id, name) => {
    const orig = get().checklists.find(c => c.id === id)
    if (!orig) return
    const duped: Checklist = {
      ...orig,
      id: genId(),
      name,
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: undefined,
      archived: false,
      items: orig.items.map(i => ({ ...i, id: genId(), done: false })),
    }
    const next = [...get().checklists, duped]
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  toggleItem: (checklistId, itemId) => {
    const next = get().checklists.map(c => {
      if (c.id !== checklistId) return c
      const items = c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i)
      const allDone = items.every(i => i.done)
      return { ...c, items, completedAt: allDone ? new Date().toISOString().split('T')[0] : undefined }
    })
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  updateItem: (checklistId, itemId, updates) => {
    const next = get().checklists.map(c => {
      if (c.id !== checklistId) return c
      return { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
    })
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  addItem: (checklistId, label) => {
    const next = get().checklists.map(c => {
      if (c.id !== checklistId) return c
      return { ...c, items: [...c.items, { id: genId(), label, done: false }] }
    })
    set({ checklists: next })
    saveToStorage(KEY, next)
  },

  removeItem: (checklistId, itemId) => {
    const next = get().checklists.map(c => {
      if (c.id !== checklistId) return c
      return { ...c, items: c.items.filter(i => i.id !== itemId) }
    })
    set({ checklists: next })
    saveToStorage(KEY, next)
  },
}))
