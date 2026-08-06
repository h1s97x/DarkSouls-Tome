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
  background: #111;
  border-right: 1px solid #430;
  position: sticky;
  top: 150px;
  height: calc(100vh - 150px);
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 1000px) {
    position: fixed;
    top: 6em;
    left: 0;
    height: calc(100vh - 6em);
    z-index: 998;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);

    &.is-open {
      transform: translateX(0);
    }
  }
}

.sidebar-toggle {
  display: none;
  position: fixed;
  top: 7em;
  left: 0.5em;
  z-index: 999;
  background: #111;
  border: 1px solid #430;
  color: #960;
  padding: 0.5em 0.75em;
  font-size: 1.2em;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #222;
    border-color: #960;
  }

  @media (max-width: 1000px) {
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
  color: #960;
  font-size: 1em;
  margin-bottom: 0.75em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid #430;
  font-weight: 700;
}

.nav-list {
  list-style: none;

  li {
    margin: 0.25em 0;
  }

  a {
    display: block;
    padding: 0.5em 0.75em;
    color: #aaa;
    transition: 0.3s;
    border-left: 3px solid transparent;
    font-size: 0.95em;

    &:hover {
      color: #960;
      background: rgba(153, 102, 0, 0.1);
      border-left-color: #960;
    }

    &.active {
      color: #960;
      background: rgba(153, 102, 0, 0.15);
      border-left-color: #960;
      font-weight: 700;
    }
  }
}

// 滚动条样式
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #430;
  border-radius: 3px;

  &:hover {
    background: #960;
  }
}
</style>
