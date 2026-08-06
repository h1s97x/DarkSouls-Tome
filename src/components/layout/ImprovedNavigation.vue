<template>
  <div :class="['improved-nav', { scrolled: isScrolled }]">
    <div class="nav-container">
      <!-- Logo 和游戏切换 -->
      <div class="nav-header">
        <router-link to="/" class="logo">
          <span class="logo-text">黑魂数据库</span>
          <span class="logo-subtitle">Dark Souls DB</span>
        </router-link>

        <div class="game-switcher">
          <button
            v-for="game in games"
            :key="game.id"
            :class="['game-btn', { active: currentGame === game.id }]"
            @click="switchGame(game.id)"
          >
            {{ game.name }}
          </button>
        </div>
      </div>

      <!-- 分类导航 -->
      <nav class="nav-categories">
        <router-link
          v-for="category in categories"
          :key="category.type"
          :to="`/ds${currentGame}/${category.type}`"
          class="category-link"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-name-en">{{ category.nameEn }}</span>
        </router-link>

        <router-link to="/favorites" class="category-link">
          <span class="category-icon">★</span>
          <span class="category-name">收藏</span>
          <span class="category-name-en">Favorites</span>
        </router-link>

        <!-- 语言切换 -->
        <div class="language-selector">
          <button
            v-for="lang in languages"
            :key="lang.value"
            :class="['lang-btn', { active: currentLanguage === lang.value }]"
            :title="lang.label"
            @click="setLanguage(lang.value)"
          >
            {{ lang.short }}
          </button>
        </div>
      </nav>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div v-if="mobileMenuOpen" class="mobile-menu">
      <div class="mobile-game-switcher">
        <button
          v-for="game in games"
          :key="game.id"
          :class="['mobile-game-btn', { active: currentGame === game.id }]"
          @click="switchGameAndClose(game.id)"
        >
          {{ game.name }}
        </button>
      </div>

      <nav class="mobile-categories">
        <router-link
          v-for="category in categories"
          :key="category.type"
          :to="`/ds${currentGame}/${category.type}`"
          class="mobile-category-link"
          @click="closeMobileMenu"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span>{{ category.name }} / {{ category.nameEn }}</span>
        </router-link>

        <router-link to="/favorites" class="mobile-category-link" @click="closeMobileMenu">
          <span class="category-icon">★</span>
          <span>收藏 / Favorites</span>
        </router-link>

        <!-- 移动端语言切换 -->
        <div class="mobile-language-selector">
          <span class="lang-label">语言 / Language:</span>
          <button
            v-for="lang in languages"
            :key="lang.value"
            :class="['mobile-lang-btn', { active: currentLanguage === lang.value }]"
            @click="setLanguage(lang.value)"
          >
            {{ lang.label }}
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Language } from '@/types/item'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const games = [
  { id: 1, name: '黑魂1' },
  { id: 2, name: '黑魂2' },
  { id: 3, name: '黑魂3' }
]

const categories = [
  { type: 'weapon', name: '武器', nameEn: 'Weapons', icon: '⚔️' },
  { type: 'armor', name: '防具', nameEn: 'Armor', icon: '🛡️' },
  { type: 'ring', name: '戒指', nameEn: 'Rings', icon: '💍' },
  { type: 'item', name: '物品', nameEn: 'Items', icon: '📦' },
  { type: 'magic', name: '法术', nameEn: 'Magic', icon: '✨' },
  { type: 'dialogue', name: '对话', nameEn: 'Dialogue', icon: '💬' }
]

const languages = [
  { value: 'chn' as Language, label: '中文', short: '中' },
  { value: 'jap' as Language, label: '日本語', short: '日' },
  { value: 'eng' as Language, label: 'English', short: 'EN' }
]

const currentGame = computed(() => {
  const match = route.path.match(/\/ds(\d)/)
  return match ? Number(match[1]) : 1
})

const currentLanguage = computed(() => userStore.currentLanguage)

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const switchGame = (gameId: number) => {
  const currentType = route.params.type
  if (currentType) {
    router.push(`/ds${gameId}/${currentType}`)
  }
}

const switchGameAndClose = (gameId: number) => {
  switchGame(gameId)
  closeMobileMenu()
}

const setLanguage = (lang: Language) => {
  userStore.setLanguage(lang)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
  // 给 body 添加/移除 class 以调整页面布局
  if (isScrolled.value) {
    document.body.classList.add('nav-scrolled')
  } else {
    document.body.classList.remove('nav-scrolled')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.classList.remove('nav-scrolled')
})
</script>

<style scoped lang="scss">
.improved-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #430;
  z-index: 999;
  transition: all 0.3s ease;

  &.scrolled {
    .nav-header {
      max-height: 0;
      padding: 0;
      opacity: 0;
      overflow: hidden;
      border-bottom: none;
    }
  }
}

.nav-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 2em;

  @media (max-width: 1000px) {
    padding: 0 1em;
  }
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6em 0;
  border-bottom: 1px solid #430;
  max-height: 100px;
  opacity: 1;
  transition: all 0.3s ease;

  @media (max-width: 1000px) {
    padding: 0.5em 0;
  }
}

.logo {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .logo-text {
    font-size: 1.5em;
    color: #960;
    font-family: '仿宋', 'SimSun', serif;
    font-weight: bold;

    @media (max-width: 1000px) {
      font-size: 1.2em;
    }
  }

  .logo-subtitle {
    font-size: 0.8em;
    color: #aaa;
    font-family: 'Palatino Linotype', serif;
    margin-top: 0.2em;

    @media (max-width: 1000px) {
      font-size: 0.7em;
    }
  }
}

.game-switcher {
  display: flex;
  gap: 0.5em;

  @media (max-width: 1000px) {
    display: none;
  }
}

.game-btn {
  padding: 0.6em 1.5em;
  background: #111;
  border: 1px solid #430;
  color: #aaa;
  font-family: '仿宋', 'SimSun', serif;
  font-size: 1em;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    border-color: #960;
    color: #960;
    background: #222;
  }

  &.active {
    background: rgba(153, 102, 0, 0.2);
    border-color: #960;
    color: #fe6;
    font-weight: bold;
  }
}

.nav-categories {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.6em 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #111;
  }

  &::-webkit-scrollbar-thumb {
    background: #430;
    border-radius: 2px;

    &:hover {
      background: #960;
    }
  }

  @media (max-width: 1000px) {
    display: none;
  }
}

.category-link {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.6em 1.2em;
  background: #111;
  border: 1px solid #430;
  color: #aaa;
  text-decoration: none;
  white-space: nowrap;
  transition: 0.3s;
  font-family: '仿宋', 'SimSun', serif;

  &:hover {
    border-color: #960;
    color: #960;
    background: #222;
    transform: translateY(-2px);
  }

  &.router-link-active {
    background: rgba(153, 102, 0, 0.2);
    border-color: #960;
    color: #fe6;
  }

  .category-icon {
    font-size: 1.2em;
  }

  .category-name {
    font-size: 1em;
  }

  .category-name-en {
    font-size: 0.85em;
    color: #888;
    font-family: 'Palatino Linotype', serif;
  }
}

.language-selector {
  display: flex;
  gap: 0.25em;
  margin-left: auto;
  padding-left: 1em;
  border-left: 1px solid #430;

  .lang-btn {
    padding: 0.4em 0.8em;
    background: #111;
    border: 1px solid #430;
    color: #aaa;
    font-family: '仿宋', 'SimSun', serif;
    font-size: 0.9em;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      border-color: #960;
      color: #960;
      background: #222;
    }

    &.active {
      background: rgba(153, 102, 0, 0.2);
      border-color: #960;
      color: #fe6;
      font-weight: bold;
    }
  }
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5em;

  span {
    display: block;
    width: 24px;
    height: 2px;
    background: #960;
    transition: 0.3s;
  }

  @media (max-width: 1000px) {
    display: flex;
  }
}

.mobile-menu {
  display: none;
  background: rgba(0, 0, 0, 0.98);
  border-top: 1px solid #430;
  padding: 1em;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 1000px) {
    display: block;
  }
}

.mobile-game-switcher {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
  padding-bottom: 1em;
  border-bottom: 1px solid #430;
}

.mobile-game-btn {
  flex: 1;
  padding: 0.8em;
  background: #111;
  border: 1px solid #430;
  color: #aaa;
  font-family: '仿宋', 'SimSun', serif;
  font-size: 1em;
  cursor: pointer;
  transition: 0.3s;

  &.active {
    background: rgba(153, 102, 0, 0.2);
    border-color: #960;
    color: #fe6;
    font-weight: bold;
  }
}

.mobile-categories {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.mobile-category-link {
  display: flex;
  align-items: center;
  gap: 0.8em;
  padding: 1em;
  background: #111;
  border: 1px solid #430;
  color: #aaa;
  text-decoration: none;
  transition: 0.3s;
  font-family: '仿宋', 'SimSun', serif;

  &.router-link-active {
    background: rgba(153, 102, 0, 0.2);
    border-color: #960;
    color: #fe6;
  }

  .category-icon {
    font-size: 1.5em;
  }
}

.mobile-language-selector {
  margin-top: 1em;
  padding: 1em;
  border-top: 1px solid #430;
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  .lang-label {
    color: #960;
    font-size: 0.9em;
    margin-bottom: 0.5em;
  }

  .mobile-lang-btn {
    padding: 0.8em;
    background: #111;
    border: 1px solid #430;
    color: #aaa;
    font-family: '仿宋', 'SimSun', serif;
    cursor: pointer;
    transition: 0.3s;

    &.active {
      background: rgba(153, 102, 0, 0.2);
      border-color: #960;
      color: #fe6;
      font-weight: bold;
    }
  }
}
</style>
