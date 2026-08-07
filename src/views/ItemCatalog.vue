<template>
  <WikiLayout>
    <ItemCatalogTable
      :items="items"
      :title="title"
      :game="gameNum"
      :type="itemType"
      :loading="loading"
      :error="error?.message"
      @retry="loadData"
    />
  </WikiLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameData } from '@/composables/useGameData'
import { GAME_NAMES, ITEM_TYPE_NAMES } from '@/utils/constants'
import WikiLayout from '@/components/layout/WikiLayout.vue'
import ItemCatalogTable from '@/components/item/ItemCatalogTable.vue'
import type { GameVersion, ItemType } from '@/types/item'

const props = defineProps<{
  game: string
  type: string
}>()

const gameNum = computed(() => Number(props.game) as GameVersion)
const itemType = computed(() => props.type as ItemType)

const title = computed(() => {
  return `${GAME_NAMES[gameNum.value]} - ${ITEM_TYPE_NAMES[itemType.value]}`
})

const { items, loading, error, loadData } = useGameData(gameNum.value, itemType.value)

onMounted(() => {
  loadData()
})
</script>
