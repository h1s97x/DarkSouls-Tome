<template>
  <WikiLayout>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error.message }}</p>
      <button @click="loadData">重试</button>
    </div>

    <div v-else-if="!item" class="not-found">
      <p>物品不存在</p>
      <router-link :to="`/ds${game}/${type}`">返回列表</router-link>
    </div>

    <template v-else>
      <!-- 面包屑 -->
      <nav class="breadcrumbs" aria-label="面包屑">
        <router-link :to="`/ds${game}/${type}`">{{ typeName }}</router-link>
        <span class="sep">›</span>
        <span class="current">{{ displayName }}</span>
      </nav>

      <!-- 物品主体 -->
      <article class="item-article">
        <header class="article-header">
          <div class="article-icon">
            <img :src="item.icon" :alt="displayName" @error="handleImageError" />
          </div>
          <div class="article-heading">
            <h1 class="article-title">{{ displayName }}</h1>
            <p class="article-sub">
              <span>{{ gameName }}</span>
              <span class="dot">·</span>
              <span>{{ typeName }}</span>
              <span class="dot">·</span>
              <span class="item-id">ID {{ item.id }}</span>
            </p>
            <button class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
              {{ isFavorite ? '★ 已收藏' : '☆ 收藏' }}
            </button>
          </div>
        </header>

        <!-- 简介 -->
        <section class="article-section">
          <h2 class="section-title">简介</h2>
          <div class="section-body item-desc" v-html="formatText(displayDescription)"></div>
        </section>

        <!-- 备注 -->
        <section v-if="displayRemark" class="article-section">
          <h2 class="section-title">备注</h2>
          <div class="section-body item-remk" v-html="formatText(displayRemark)"></div>
        </section>
      </article>

      <!-- 相关物品 -->
      <section v-if="relatedItems.length > 0" class="related-section">
        <h2 class="section-title">相关物品</h2>
        <div class="related-grid">
          <router-link
            v-for="related in relatedItems"
            :key="itemKey(related)"
            :to="`/ds${game}/${type}/${related.id}`"
            class="related-item"
          >
            <img :src="related.icon" :alt="getItemName(related)" @error="handleImageError" />
            <span class="related-name">{{ getItemName(related) }}</span>
          </router-link>
        </div>
      </section>
    </template>
  </WikiLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useGameData } from '@/composables/useGameData'
import { useUserStore } from '@/stores/user'
import { dataService, itemKey } from '@/services/dataService'
import { GAME_NAMES, ITEM_TYPE_NAMES } from '@/utils/constants'
import { formatGameText } from '@/utils/formatter'
import WikiLayout from '@/components/layout/WikiLayout.vue'
import type { GameVersion, ItemType, Item } from '@/types/item'

const props = defineProps<{
  game: string
  type: string
  id: string
}>()

const userStore = useUserStore()

const gameNum = computed(() => Number(props.game) as GameVersion)
const itemType = computed(() => props.type as ItemType)

const gameName = computed(() => GAME_NAMES[gameNum.value] || '')
const typeName = computed(() => ITEM_TYPE_NAMES[itemType.value] || '')

const { items, loading, error, loadData } = useGameData(gameNum.value, itemType.value)

const item = computed(() => {
  return items.value.find((i) => i.id === props.id)
})

const isFavorite = computed(() => {
  return item.value ? userStore.isFavorite(item.value) : false
})

const displayName = computed(() => {
  if (!item.value) return ''
  return item.value.name[userStore.currentLanguage]
})

const displayDescription = computed(() => {
  if (!item.value) return ''
  return item.value.description[userStore.currentLanguage]
})

const displayRemark = computed(() => {
  if (!item.value || !item.value.remark) return ''
  return item.value.remark[userStore.currentLanguage] || ''
})

const relatedItems = ref<Item[]>([])

const loadRelatedItems = async () => {
  if (!item.value) {
    relatedItems.value = []
    return
  }
  try {
    relatedItems.value = await dataService.getRelatedItems(item.value)
  } catch (e) {
    console.error('Failed to load related items:', e)
    relatedItems.value = []
  }
}

const getItemName = (item: Item) => {
  return item.name[userStore.currentLanguage]
}

const formatText = (text: string) => {
  return formatGameText(text || '')
}

const toggleFavorite = () => {
  if (item.value) {
    userStore.toggleFavorite(item.value)
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadData()
})

// 物品加载完成后加载相关物品
watch(
  item,
  () => {
    loadRelatedItems()
  },
  { immediate: true }
)

watch(
  () => props.id,
  () => {
    if (items.value.length === 0) {
      loadData()
    }
  }
)
</script>

<style scoped lang="scss">
.loading,
.error,
.not-found {
  text-align: center;
  padding: 4em 2em;
  color: var(--color-text-secondary);

  .loading-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 1em;
  }

  button,
  a {
    margin-top: 1em;
    padding: 0.5em 2em;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-accent);
    cursor: pointer;
    display: inline-block;
    text-decoration: none;

    &:hover {
      border-color: var(--color-accent);
    }
  }
}

/* ---------- 面包屑 ---------- */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 1.25em;
  font-size: 0.9em;
  color: var(--color-text-muted);

  a {
    color: var(--color-link);
  }

  .sep {
    color: var(--color-text-muted);
  }

  .current {
    color: var(--color-text);
    font-weight: 600;
  }
}

/* ---------- 物品主体 ---------- */
.item-article {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 2em 2.5em;
  margin-bottom: 2em;

  @media (max-width: 768px) {
    padding: 1.25em 1.25em;
  }
}

.article-header {
  display: flex;
  gap: 1.75em;
  align-items: flex-start;
  padding-bottom: 1.5em;
  margin-bottom: 1.5em;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1em;
  }
}

.article-icon {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 12px;

  img {
    max-width: 88px;
    max-height: 88px;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 90px;
    height: 90px;

    img {
      max-width: 64px;
      max-height: 64px;
    }
  }
}

.article-heading {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 1.9em;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.35em;

  @media (max-width: 768px) {
    font-size: 1.45em;
  }
}

.article-sub {
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: var(--color-text-muted);
  font-size: 0.95em;
  margin-bottom: 1.1em;
  flex-wrap: wrap;

  .dot {
    color: var(--color-border-strong);
  }
}

.favorite-btn {
  padding: 0.5em 1.4em;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-accent);
  font-weight: 600;

  &:hover {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
  }

  &.active {
    background: var(--color-accent-soft);
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }
}

/* ---------- 章节 ---------- */
.article-section {
  margin-bottom: 1.75em;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 1.2em;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.75em;
  padding-bottom: 0.35em;
  border-bottom: 2px solid var(--color-accent-border);

  @media (max-width: 768px) {
    font-size: 1.1em;
  }
}

.section-body {
  color: var(--color-text);
  line-height: 1.9;
  font-size: 1em;

  :deep(p) {
    margin: 0;
    padding: 0.55em 0;

    &:not(:last-child) {
      border-bottom: 1px dashed var(--color-border-light);
    }
  }
}

.item-remk {
  background: var(--color-bg-tertiary);
  border-left: 3px solid var(--color-accent);
  border-radius: 0 8px 8px 0;
  padding: 0.75em 1.25em;
  color: var(--color-text-secondary);

  :deep(p) {
    border-bottom: none !important;
  }
}

/* ---------- 相关物品 ---------- */
.related-section {
  margin-top: 0.5em;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1em;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75em;
  }
}

.related-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6em;
  padding: 1em 0.75em;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: var(--color-text);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
    border-color: var(--color-accent-border);
    text-decoration: none;
    color: var(--color-text);
  }

  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }

  .related-name {
    font-size: 0.85em;
    text-align: center;
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
