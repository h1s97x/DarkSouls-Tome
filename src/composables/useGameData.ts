import { ref, computed } from 'vue'
import type { Item, GameVersion, ItemType } from '@/types/item'

export function useGameData(game: GameVersion, type: ItemType) {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadData = async () => {
    loading.value = true
    error.value = null

    try {
      // 动态导入JSON数据
      const module = await import(`@/data/ds${game}/${type}s.json`)
      items.value = module.default
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
