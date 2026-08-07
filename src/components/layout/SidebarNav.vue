<template>
  <aside class="sidebar-nav" :class="{ 'is-open': isOpen }">
    <!-- 移动端切换按钮 -->
    <button class="sidebar-toggle mobile" @click="toggleSidebar">
      <span v-if="!isOpen">☰</span>
      <span v-else>✕</span>
    </button>

    <div class="sidebar-content">
      <!-- 游戏选择 -->
      <div class="nav-section">
        <h3 class="section-title">游戏</h3>
        <ul class="nav-list">
          <li v-for="game in [1, 2, 3]" :key="game">
            <router-link
              :to="`/ds${game}/${currentType}`"
              :class="{ active: currentGame === game }"
              @click="closeSidebar"
            >
              黑暗之魂{{ game }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- 物品分类 -->
      <div class="nav-section">
        <h3 class="section-title">物品</h3>
        <ul class="nav-list">
          <li v-for="type in itemTypes" :key="type.value">
            <router-link
              :to="`/ds${currentGame}/${type.value}`"
              :class="{ active: currentType === type.value }"
              @click="closeSidebar"
            >
              {{ type.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- 其他功能 -->
      <div class="nav-section">
        <h3 class="section-title">其他</h3>
        <ul class="nav-list">
          <li>
            <router-link :to="`/ds${currentGame}/dialogue`" @click="closeSidebar">
              对话
            </router-link>
          </li>
          <li>
            <router-link to="/favorites" @click="closeSidebar"> 收藏 </router-link>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ItemType } from '@/types/item'

const route = useRoute()
const isOpen = ref(false)

const currentGame = computed(() => {
  const game = route.params.game as string
  return game ? Number(game) : 1
})

const currentType = computed(() => {
  return (route.params.type as ItemType) || 'weapon'
})

const itemTypes = [
  { value: 'weapon' as ItemType, label: '武器' },
  { value: 'armor' as ItemType, label: '防具' },
  { value: 'ring' as ItemType, label: '戒指' },
  { value: 'item' as ItemType, label: '物品' },
  { value: 'magic' as ItemType, label: '法术' }
]

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const closeSidebar = () => {
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.sidebar-nav {
  width: 200px;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  position: sticky;
  top: var(--nav-height, 64px);
  height: calc(100vh - var(--nav-height, 64px));
  overflow-y: auto;

  @media (max-width: 900px) {
    position: fixed;
    top: var(--nav-height-mobile, 56px);
    left: 0;
    height: calc(100vh - var(--nav-height-mobile, 56px));
    z-index: 998;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

    &.is-open {
      transform: translateX(0);
    }
  }
}

.sidebar-toggle {
  display: none;
  position: fixed;
  top: calc(var(--nav-height, 64px) + 0.5em);
  left: 0.5em;
  z-index: 999;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-accent);
  padding: 0.45em 0.7em;
  font-size: 1.1em;
  cursor: pointer;
  box-shadow: var(--shadow-card);

  &:hover {
    border-color: var(--color-accent);
  }

  @media (max-width: 900px) {
    display: block;
  }
}

.sidebar-content {
  padding: 1.5em 1em;
}

.nav-section {
  margin-bottom: 2em;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  color: var(--color-text-secondary);
  font-size: 0.8em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75em;
  padding-bottom: 0.4em;
  border-bottom: 1px solid var(--color-border);
}

.nav-list {
  list-style: none;

  li {
    margin: 0.15em 0;
  }

  a {
    display: block;
    padding: 0.5em 0.75em;
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: 6px;
    border-left: 3px solid transparent;
    font-size: 0.95em;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover {
      color: var(--color-accent);
      background: var(--color-accent-soft);
    }

    &.active {
      color: var(--color-accent-strong);
      background: var(--color-accent-soft);
      border-left-color: var(--color-accent);
      font-weight: 700;
    }
  }
}

// 滚动条样式
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 3px;

  &:hover {
    background: var(--color-accent);
  }
}
</style>
