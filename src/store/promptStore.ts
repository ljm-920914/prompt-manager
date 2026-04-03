import { create } from 'zustand'

export interface Prompt {
  id: string
  title: string
  content: string
  description: string | null
  source: string | null
  sourceType: string
  category: string
  isFavorite: boolean
  tags: { id: string; name: string }[]
  createdAt: string
  updatedAt: string
}

interface PromptStore {
  prompts: Prompt[]
  categories: string[]
  selectedCategory: string
  searchQuery: string
  showFavoritesOnly: boolean
  isLoading: boolean
  
  setPrompts: (prompts: Prompt[]) => void
  setCategories: (categories: string[]) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setShowFavoritesOnly: (show: boolean) => void
  setIsLoading: (loading: boolean) => void
  
  fetchPrompts: () => Promise<void>
  fetchCategories: () => Promise<void>
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePrompt: (id: string, data: Partial<Prompt>) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  categories: [],
  selectedCategory: 'all',
  searchQuery: '',
  showFavoritesOnly: false,
  isLoading: false,

  setPrompts: (prompts) => set({ prompts }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  fetchPrompts: async () => {
    const { selectedCategory, searchQuery, showFavoritesOnly } = get()
    set({ isLoading: true })
    
    const params = new URLSearchParams()
    if (selectedCategory !== 'all') params.append('category', selectedCategory)
    if (searchQuery) params.append('search', searchQuery)
    if (showFavoritesOnly) params.append('favorite', 'true')
    
    const res = await fetch(`/api/prompts?${params}`)
    const prompts = await res.json()
    set({ prompts, isLoading: false })
  },

  fetchCategories: async () => {
    const res = await fetch('/api/categories')
    const categories = await res.json()
    set({ categories })
  },

  addPrompt: async (promptData) => {
    const res = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData)
    })
    const newPrompt = await res.json()
    set((state) => ({ prompts: [newPrompt, ...state.prompts] }))
  },

  updatePrompt: async (id, data) => {
    const res = await fetch(`/api/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const updatedPrompt = await res.json()
    set((state) => ({
      prompts: state.prompts.map((p) => (p.id === id ? updatedPrompt : p))
    }))
  },

  deletePrompt: async (id) => {
    await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id)
    }))
  },

  toggleFavorite: async (id) => {
    const prompt = get().prompts.find((p) => p.id === id)
    if (!prompt) return
    
    await get().updatePrompt(id, { isFavorite: !prompt.isFavorite })
  }
}))
