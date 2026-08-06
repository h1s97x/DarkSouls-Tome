import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Item, Language } from '@/types/item'
import { itemKey } from '@/services/dataService'

/**
 * 判断收藏集合中是否存在引用指定 id 的复合键（game:type:id）。
 * 旧版纯 id 与复合键并存时，仅当不存在任何同 id 复合键才可安全清理纯 id，
 * 避免误删共用同一 id 的其他物品收藏。endsWith 精确匹配末段 id，防止 :100 误伤 :1000。
 */
const hasCompositeKeyForId = (favorites: Set<string>, id: string): boolean =>
  [...favorites].some((k) => k.includes(':') && k.endsWith(`:${id}`))

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

  /**
   * 判断物品是否已收藏
   * 兼容旧数据：优先匹配复合键（精确），其次匹配旧版纯 id（跨文件重复时返回全部匹配）。
   */
  const isFavorite = (item: Pick<Item, 'game' | 'type' | 'id'>) => {
    return favorites.value.has(itemKey(item)) || favorites.value.has(item.id)
  }

  /**
   * 切换收藏状态（存入复合键，精确收藏）
   * 若存在旧版纯 id 收藏则一并升级为复合键，避免重复。
   */
  const toggleFavorite = (item: Pick<Item, 'game' | 'type' | 'id'>) => {
    const key = itemKey(item)
    if (favorites.value.has(key)) {
      favorites.value.delete(key)
      // 若该 id 已无任何复合键收藏，同步清理遗留的旧版纯 id，避免本物品仍被误判为已收藏
      if (!hasCompositeKeyForId(favorites.value, item.id)) {
        favorites.value.delete(item.id)
      }
    } else {
      // 仅当不存在同 id 的其他复合键收藏时才删除旧 id，避免误删共用同一 id 的其他物品收藏
      if (!hasCompositeKeyForId(favorites.value, item.id)) {
        favorites.value.delete(item.id) // 升级旧版纯 id 收藏
      }
      favorites.value.add(key)
    }
  }

  /**
   * 移除收藏（同时兼容复合键与旧版纯 id 收藏）
   */
  const removeFavorite = (item: Pick<Item, 'game' | 'type' | 'id'>) => {
    // 同时清理复合键与旧版纯 id，避免遗留孤儿纯 id 导致物品移除后仍显示为已收藏
    favorites.value.delete(itemKey(item))
    favorites.value.delete(item.id)
  }

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
    removeFavorite,
    isFavorite
  }
})
