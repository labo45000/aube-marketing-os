import { create } from 'zustand'
import type { Milestone } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedMilestones } from '../data/seed'

interface RoadmapStore {
  milestones: Milestone[]
  addMilestone: (m: Omit<Milestone, 'id'>) => void
  updateMilestone: (id: string, updates: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void
  reorderMilestones: (milestones: Milestone[]) => void
}

const KEY = 'dube_roadmap'

export const useRoadmapStore = create<RoadmapStore>((set, get) => ({
  milestones: loadFromStorage<Milestone[]>(KEY, seedMilestones),

  addMilestone: (m) => {
    const next = [...get().milestones, { ...m, id: genId() }]
    set({ milestones: next })
    saveToStorage(KEY, next)
  },

  updateMilestone: (id, updates) => {
    const next = get().milestones.map(m => m.id === id ? { ...m, ...updates } : m)
    set({ milestones: next })
    saveToStorage(KEY, next)
  },

  deleteMilestone: (id) => {
    const next = get().milestones.filter(m => m.id !== id)
    set({ milestones: next })
    saveToStorage(KEY, next)
  },

  reorderMilestones: (milestones) => {
    set({ milestones })
    saveToStorage(KEY, milestones)
  },
}))
