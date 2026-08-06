import { ref, computed } from 'vue'
import { dataService } from '@/services/dataService'
import type { Item, GameVersion, ItemType } from '@/types/item'

export function useGameData(game: GameVersion, type: ItemType) {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadData = async () => {
    loading.value = true
    error.value = null

    try {
      // 数据访问统一收口到 dataService，模块级缓存避免重复加载
      items.value = await dataService.getItems(game, type)
    } catch (e) {
      error.value = e as Error
      console.error(`Failed to load ${type}s for DS${game}:`, e)
    } finally {
      loading.value = false
    }
  }

  const itemCount = computed(() => items.value.length)

  return {
    items,
    loading,
    error,
    loadData,
    itemCount
  }
}
