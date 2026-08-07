<template>
  <header :class="['wiki-nav', { scrolled: isScrolled }]">
    <!-- 顶栏：Logo + 游戏切换 + 工具按钮 -->
    <div class="nav-top">
      <div class="nav-top-inner">
        <router-link to="/" class="logo">
          <span class="logo-text">Dark Souls</span>
          <span class="logo-sub">黑魂文本数据库</span>
        </router-link>

        <div class="nav-actions">
          <div class="game-switcher" role="tablist" aria-label="选择游戏">
            <button
              v-for="game in games"
              :key="game.id"
              :class="['game-btn', { active: currentGame === game.id }]"
              @click="switchGame(game.id)"
            >
              {{ game.name }}
            </button>
          </div>

          <div class="tool-buttons">
            <button
              class="icon-btn"
              :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
              @click="themeStore.toggleTheme()"
            >
              <span v-if="currentTheme === 'dark'">☀️</span>
              <span v-else>🌙</span>
            </button>
            <button
              class="mobile-menu-btn"
              :aria-expanded="mobileMenuOpen"
              @click="toggleMobileMenu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类导航条 -->
    <nav class="nav-categories" aria-label="物品分类">
      <div class="nav-categories-inner">
        <router-link
          v-for="category in categories"
          :key="category.type"
          :to="`/ds${currentGame}/${category.type}`"
          class="category-link"
          :class="{ active: isCategoryActive(category.type) }"
        >
          {{ category.name }}
          <span class="category-en">{{ category.nameEn }}</span>
        </router-link>

        <router-link
          to="/favorites"
          class="category-link"
          :class="{ active: route.path.startsWith('/favorites') }"
        >
          收藏 <span class="category-en">Favorites</span>
        </router-link>

        <div class="nav-spacer"></div>

        <!-- 语言切换 -->
        <div class="language-selector" role="tablist" aria-label="切换语言">
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
      </div>
    </nav>

    <!-- 移动端抽屉 -->
    <div v-if="mobileMenuOpen" class="mobile-drawer">
      <div class="mobile-section">
        <p class="mobile-section-title">选择游戏</p>
        <div class="mobile-game-grid">
          <button
            v-for="game in games"
            :key="game.id"
            :class="['mobile-game-btn', { active: currentGame === game.id }]"
            @click="switchGameAndClose(game.id)"
          >
            {{ game.name }}
          </button>
        </div>
      </div>

      <div class="mobile-section">
        <p class="mobile-section-title">物品分类</p>
        <router-link
          v-for="category in categories"
          :key="category.type"
          :to="`/ds${currentGame}/${category.type}`"
          class="mobile-category-link"
          @click="closeMobileMenu"
        >
          {{ category.name }}
          <span class="category-en">{{ category.nameEn }}</span>
        </router-link>
        <router-link to="/favorites" class="mobile-category-link" @click="closeMobileMenu">
          收藏 <span class="category-en">Favorites</span>
        </router-link>
      </div>

      <div class="mobile-section">
        <p class="mobile-section-title">语言</p>
        <div class="mobile-lang-row">
          <button
            v-for="lang in languages"
            :key="lang.value"
            :class="['mobile-lang-btn', { active: currentLanguage === lang.value }]"
            @click="setLanguage(lang.value)"
          >
            {{ lang.label }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import type { Language } from '@/types/item'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const games = [
  { id: 1, name: '黑暗之魂' },
  { id: 2, name: '黑暗之魂2' },
  { id: 3, name: '黑暗之魂3' }
]

const categories = [
  { type: 'weapon', name: '武器', nameEn: 'Weapons' },
  { type: 'armor', name: '防具', nameEn: 'Armors' },
  { type: 'ring', name: '戒指', nameEn: 'Rings' },
  { type: 'item', name: '物品', nameEn: 'Items' },
  { type: 'magic', name: '法术', nameEn: 'Magics' },
  { type: 'dialogue', name: '对话', nameEn: 'Dialogue' }
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
const currentTheme = computed(() => themeStore.currentTheme)

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const isCategoryActive = (type: string) => {
  return route.params.type === type || route.path.endsWith(`/${type}`)
}

const switchGame = (gameId: number) => {
  const currentType = route.params.type as string
  if (currentType) {
    router.push(`/ds${gameId}/${currentType}`)
  } else if (route.path.startsWith('/ds')) {
    router.push(`/ds${gameId}/weapon`)
  } else {
    // 首页等无分类上下文时，跳转到对应游戏的武器页
    router.push(`/ds${gameId}/weapon`)
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
  isScrolled.value = window.scrollY > 60
  document.body.classList.toggle('nav-scrolled', isScrolled.value)
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
.wiki-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: var(--color-header-bg);
  color: var(--color-header-text);
  box-shadow: var(--shadow-nav);
  transition: all 0.3s ease;
}

/* ---------- 顶栏 ---------- */
.nav-top {
  background: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border-strong);
  transition: all 0.3s ease;
}

.wiki-nav.scrolled .nav-top {
  border-bottom-color: transparent;
}

.nav-top-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.55em 1.5em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;

  @media (max-width: 768px) {
    padding: 0.4em 1em;
  }
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
  text-decoration: none;
  color: var(--color-header-text);

  &:hover {
    text-decoration: none;
  }

  .logo-text {
    font-family: 'Palatino Linotype', Georgia, 'Times New Roman', serif;
    font-size: 1.35em;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--color-accent-strong);

    @media (max-width: 768px) {
      font-size: 1.1em;
    }
  }

  .logo-sub {
    font-size: 0.8em;
    color: var(--color-header-text-muted);
    white-space: nowrap;

    @media (max-width: 560px) {
      display: none;
    }
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1em;
}

.game-switcher {
  display: flex;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-header-bg-soft);

  @media (max-width: 768px) {
    display: none;
  }
}

.game-btn {
  padding: 0.4em 1.1em;
  color: var(--color-header-text-muted);
  font-size: 0.9em;
  white-space: nowrap;

  &:hover {
    color: var(--color-header-text);
    background: var(--color-header-bg-soft);
  }

  &.active {
    background: var(--color-accent);
    color: #1a1408;
    font-weight: 700;
  }
}

.tool-buttons {
  display: flex;
  align-items: center;
  gap: 0.4em;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-header-bg-soft);
  color: var(--color-header-text);
  font-size: 1rem;

  &:hover {
    border-color: var(--color-accent);
  }
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-header-bg-soft);

  span {
    display: block;
    width: 20px;
    height: 2px;
    background: var(--color-header-text);
  }

  @media (max-width: 768px) {
    display: flex;
  }
}

/* ---------- 分类导航 ---------- */
.nav-categories {
  background: var(--color-header-bg-soft);
  border-bottom: 2px solid var(--color-accent);
  transition: all 0.3s ease;
}

.nav-categories-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5em;
  display: flex;
  align-items: center;
  gap: 0.25em;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 0 0.75em;
  }
}

.category-link {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.75em 1em;
  color: var(--color-header-text-muted);
  font-size: 0.95em;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;

  &:hover {
    color: var(--color-header-text);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.04);
  }

  &.active {
    color: var(--color-accent-strong);
    font-weight: 700;
    border-bottom-color: var(--color-accent);
  }

  .category-en {
    font-size: 0.72em;
    opacity: 0.7;
    font-family: 'Palatino Linotype', Georgia, serif;
  }
}

.nav-spacer {
  flex: 1;
}

.language-selector {
  display: flex;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-header-bg);

  @media (max-width: 768px) {
    display: none;
  }
}

.lang-btn {
  padding: 0.35em 0.8em;
  color: var(--color-header-text-muted);
  font-size: 0.85em;

  &:hover {
    color: var(--color-header-text);
  }

  &.active {
    background: var(--color-accent);
    color: #1a1408;
    font-weight: 700;
  }
}

/* ---------- 移动端抽屉 ---------- */
.mobile-drawer {
  display: none;
  background: var(--color-header-bg);
  border-top: 1px solid var(--color-border-strong);
  padding: 1em 1.25em 1.5em;
  max-height: calc(100vh - 56px);
  overflow-y: auto;

  @media (max-width: 768px) {
    display: block;
  }
}

.mobile-section {
  margin-bottom: 1.25em;

  &:last-child {
    margin-bottom: 0;
  }
}

.mobile-section-title {
  font-size: 0.8em;
  color: var(--color-header-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.6em;
}

.mobile-game-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5em;
}

.mobile-game-btn {
  padding: 0.7em;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-header-bg-soft);
  color: var(--color-header-text-muted);
  font-size: 0.9em;

  &.active {
    background: var(--color-accent);
    color: #1a1408;
    font-weight: 700;
  }
}

.mobile-category-link {
  display: flex;
  justify-content: space-between;
  padding: 0.75em 0.5em;
  color: var(--color-header-text);
  border-bottom: 1px solid var(--color-border-strong);

  &:hover {
    text-decoration: none;
    color: var(--color-accent-strong);
  }

  .category-en {
    font-size: 0.75em;
    opacity: 0.6;
  }
}

.mobile-lang-row {
  display: flex;
  gap: 0.5em;
}

.mobile-lang-btn {
  flex: 1;
  padding: 0.7em;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-header-bg-soft);
  color: var(--color-header-text-muted);

  &.active {
    background: var(--color-accent);
    color: #1a1408;
    font-weight: 700;
  }
}
</style>
