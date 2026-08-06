import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Language } from '@/types/item'

export const useUserStore = defineStore('user', () => {
  const currentLanguage = ref<Language>('chn')
  const favorites = ref<Set<string>>(new Set())

  // 语言设置
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    localStorage.setItem('preferred-language', lang)
  }

  const loadLanguage = () => {
    const saved = localStorage.getItem('preferred-language') as Language
    if (saved && ['chn', 'jap', 'eng'].includes(saved)) {
      currentLanguage.value = saved
    }
  }

  // 收藏功能
  const loadFavorites = () => {
    const saved = localStorage.getItem('ds-favorites')
    if (saved) {
      favorites.value = new Set(JSON.parse(saved))
    }
  }

  const toggleFavorite = (id: string) => {
    if (favorites.value.has(id)) {
      favorites.value.delete(id)
    } else {
      favorites.value.add(id)
    }
  }

  const isFavorite = (id: string) => favorites.value.has(id)

  // 监听收藏变化，自动保存
  watch(
    favorites,
    (newFavorites) => {
      localStorage.setItem('ds-favorites', JSON.stringify([...newFavorites]))
    },
    { deep: true }
  )

  return {
    currentLanguage,
    setLanguage,
    loadLanguage,
    favorites,
    loadFavorites,
    toggleFavorite,
    isFavorite
  }
})
