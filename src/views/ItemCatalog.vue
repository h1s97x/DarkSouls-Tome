<template>
  <div class="item-catalog-view">
    <ImprovedNavigation />
    <div class="catalog-layout">
      <SidebarNav />
      <main class="catalog-main">
        <ItemCatalogTable
          :items="items"
          :title="title"
          :game="gameNum"
          :type="itemType"
          :loading="loading"
          :error="error?.message"
          @retry="loadData"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameData } from '@/composables/useGameData'
import { GAME_NAMES, ITEM_TYPE_NAMES } from '@/utils/constants'
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
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

<style scoped lang="scss">
.item-catalog-view {
  min-height: 100vh;
  background: #000;
}

.catalog-layout {
  display: flex;
  padding-top: var(--nav-height, 110px);
  transition: padding-top 0.3s ease;

  @media (max-width: 1000px) {
    padding-top: var(--nav-height-mobile, 95px);
  }
}

.catalog-main {
  flex: 1;
  min-width: 0;
}
</style>
