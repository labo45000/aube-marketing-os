import { create } from 'zustand'
import type { Contact, Interaction } from '../types'
import { loadFromStorage, saveToStorage, genId } from '../utils/storage'
import { seedContacts } from '../data/seed'

interface OutreachStore {
  contacts: Contact[]
  addContact: (c: Omit<Contact, 'id' | 'interactions'>) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  addInteraction: (contactId: string, interaction: Omit<Interaction, 'id'>) => void
  deleteInteraction: (contactId: string, interactionId: string) => void
}

const KEY = 'dube_outreach'

export const useOutreachStore = create<OutreachStore>((set, get) => ({
  contacts: loadFromStorage<Contact[]>(KEY, seedContacts),

  addContact: (c) => {
    const next = [...get().contacts, { ...c, id: genId(), interactions: [] }]
    set({ contacts: next })
    saveToStorage(KEY, next)
  },

  updateContact: (id, updates) => {
    const next = get().contacts.map(c => c.id === id ? { ...c, ...updates } : c)
    set({ contacts: next })
    saveToStorage(KEY, next)
  },

  deleteContact: (id) => {
    const next = get().contacts.filter(c => c.id !== id)
    set({ contacts: next })
    saveToStorage(KEY, next)
  },

  addInteraction: (contactId, interaction) => {
    const next = get().contacts.map(c => {
      if (c.id !== contactId) return c
      const interactions = [...c.interactions, { ...interaction, id: genId() }]
      return { ...c, interactions, lastContact: interaction.date }
    })
    set({ contacts: next })
    saveToStorage(KEY, next)
  },

  deleteInteraction: (contactId, interactionId) => {
    const next = get().contacts.map(c => {
      if (c.id !== contactId) return c
      return { ...c, interactions: c.interactions.filter(i => i.id !== interactionId) }
    })
    set({ contacts: next })
    saveToStorage(KEY, next)
  },
}))
