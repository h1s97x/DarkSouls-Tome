<template>
  <div class="item-detail-view">
    <ImprovedNavigation />
    <div class="detail-layout">
      <SidebarNav />
      <main class="detail-main">
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

        <div v-else class="contentd">
          <!-- 物品框架 -->
          <div class="frame">
            <!-- 标题装饰线 -->
            <div class="title-line"></div>

            <!-- 物品标题 -->
            <div class="item-title">{{ displayName }}</div>

            <div class="title-line"></div>

            <!-- 内容区域 -->
            <div class="content-wrapper">
              <!-- 左侧图标 -->
              <div class="left-icon">
                <img :src="item.icon" :alt="displayName" @error="handleImageError" />
              </div>

              <!-- 右侧内容 -->
              <div class="right-content">
                <!-- 物品描述 -->
                <div class="item-desc" v-html="formatText(displayDescription)"></div>

                <!-- 备注 -->
                <div
                  v-if="displayRemark"
                  class="item-remk"
                  v-html="formatText(displayRemark)"
                ></div>
              </div>
            </div>

            <!-- 底部装饰线 -->
            <div class="title-line"></div>

            <!-- 收藏按钮 -->
            <div class="actions">
              <button class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
                {{ isFavorite ? '★ 已收藏' : '☆ 收藏' }}
              </button>
            </div>
          </div>

          <!-- 相关物品 -->
          <div v-if="relatedItems.length > 0" class="related-section">
            <div class="frame">
              <p class="section-title">相关物品</p>
              <router-link
                v-for="related in relatedItems"
                :key="related.id"
                :to="`/ds${game}/${type}/${related.id}`"
                class="icon related-item"
              >
                <img :src="related.icon" :alt="getItemName(related)" @error="handleImageError" />
              </router-link>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useGameData } from '@/composables/useGameData'
import { useUserStore } from '@/stores/user'
import { formatGameText } from '@/utils/formatter'
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import type { GameVersion, ItemType, Item } from '@/types/item'

const props = defineProps<{
  game: string
  type: string
  id: string
}>()

const userStore = useUserStore()

const gameNum = computed(() => Number(props.game) as GameVersion)
const itemType = computed(() => props.type as ItemType)

const { items, loading, error, loadData } = useGameData(gameNum.value, itemType.value)

const item = computed(() => {
  return items.value.find((i) => i.id === props.id)
})

const isFavorite = computed(() => {
  return item.value ? userStore.isFavorite(item.value.id) : false
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

const relatedItems = computed(() => {
  if (!item.value) return []
  const others = items.value.filter((i) => i.id !== item.value!.id)
  return others.sort(() => Math.random() - 0.5).slice(0, 8)
})

const getItemName = (item: Item) => {
  return item.name[userStore.currentLanguage]
}

const formatText = (text: string) => {
  return formatGameText(text || '')
}

const toggleFavorite = () => {
  if (item.value) {
    userStore.toggleFavorite(item.value.id)
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadData()
})

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
.item-detail-view {
  min-height: 100vh;
  background: #000;
}

.detail-layout {
  display: flex;
  padding-top: var(--nav-height, 110px);
  transition: padding-top 0.3s ease;

  @media (max-width: 1000px) {
    padding-top: var(--nav-height-mobile, 95px);
  }
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.loading,
.error,
.not-found {
  text-align: center;
  padding: 4em 2em;
  color: #ccc;
  font-family: '仿宋', 'SimSun', serif;

  .loading-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 1em;
    border: 4px solid #430;
    border-top-color: #960;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  button,
  a {
    margin-top: 1em;
    padding: 0.5em 2em;
    background: #111;
    border: 1px solid #430;
    color: #960;
    font-family: '仿宋', 'SimSun', serif;
    cursor: pointer;
    transition: 0.3s;
    display: inline-block;
    text-decoration: none;

    &:hover {
      border-color: #960;
      background: #222;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 原版风格
.contentd {
  width: 1800px;
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 1800px) {
    width: 100%;
    padding: 0 1em;
  }
}

.frame {
  text-align: center;
  overflow: hidden;
  background: #111;
  padding: 3em 2em;
  margin: 1em 0 2em;
  box-shadow: inset 0 0 0.3em 0.1em #531;
  font:
    18px/1.5 '仿宋',
    'SimSun',
    serif;
  color: #ccc;
  position: relative;

  @media (max-width: 1000px) {
    font:
      12px/1.5 '仿宋',
      'SimSun',
      serif;
    margin: 0 0 2em;
  }
}

.title-line {
  height: 1px;
  background: linear-gradient(to right, transparent, #960, transparent);
  margin: 2em 0;

  @media (max-width: 1000px) {
    margin: 1.5em 0;
  }
}

.item-title {
  font-size: 2em;
  font-weight: 700;
  color: #960;
  font-family: 'Palatino Linotype', '仿宋', serif;
  text-align: center;
  padding: 0 2em;

  @media (max-width: 1000px) {
    font-size: 1.5em;
    padding: 0 1em;
  }
}

.content-wrapper {
  display: flex;
  gap: 3em;
  padding: 2em 3em;
  align-items: flex-start;

  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 2em;
    padding: 1.5em 1em;
    align-items: center;
  }
}

.left-icon {
  flex-shrink: 0;
  width: 150px;

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  @media (max-width: 1000px) {
    width: 120px;
  }
}

.right-content {
  flex: 1;
  min-width: 0;
}

.item-desc {
  line-height: 1.8;
  margin-bottom: 2em;

  :deep(p) {
    margin: 0;
    padding: 0.5em 0;

    &:not(:last-child) {
      border-bottom: 1px solid #321;
    }
  }

  @media (max-width: 1000px) {
    font-size: 1.1em;
    margin-bottom: 1.5em;

    :deep(p) {
      padding: 0.8em 0;
    }
  }
}

.item-remk {
  color: #fe6;
  line-height: 1.8;

  :deep(p) {
    margin: 0;
    padding: 0.5em 0;
  }

  @media (max-width: 1000px) {
    font-size: 1.1em;

    :deep(p) {
      padding: 0.8em 0;
    }
  }
}

.actions {
  clear: both;
  padding: 2em 0 0;
  text-align: center;

  .favorite-btn {
    padding: 0.6em 1.5em;
    background: #222;
    border: 1px solid #430;
    color: #960;
    font-family: '仿宋', 'SimSun', serif;
    cursor: pointer;
    transition: 0.3s;
    font-size: 1em;

    &:hover {
      background: #333;
      border-color: #960;
    }

    &.active {
      background: rgba(153, 102, 0, 0.2);
      border-color: #960;
      color: #fe6;
    }
  }

  @media (max-width: 1000px) {
    padding: 1.5em 0 0;
  }
}

.related-section {
  .section-title {
    color: #960;
    font-size: 1.2em;
    margin-bottom: 1em;
    font-weight: 700;
  }

  .related-item {
    float: left;
    width: 10%;
    height: 11em;
    margin: 0 1.2em;
    opacity: 0.85;
    transition: 0.3s;

    &:hover {
      opacity: 1;
      border: 5px solid #531;
    }

    img {
      margin: 0;
      transform: none;
    }

    @media (max-width: 1000px) {
      margin: 5em 0;
      width: 33%;
      height: auto;
    }
  }
}
</style>
