<template>
  <div class="dialogue-list-view">
    <ImprovedNavigation />
    <div class="dialogue-list-layout">
      <SidebarNav />
      <main class="dialogue-list-main">
        <div class="dialogue-list-container">
          <h2 class="page-title">{{ title }}</h2>

          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="error" class="error">
            <p>❌ 加载失败</p>
            <p class="error-message">{{ error }}</p>
          </div>

          <div v-else-if="npcList.length === 0" class="empty">
            <p>暂无对话数据</p>
          </div>

          <div v-else class="npc-grid">
            <router-link
              v-for="npc in npcList"
              :key="npc"
              :to="`/ds${game}/dialogue/${npc}`"
              class="npc-card"
            >
              <div class="npc-icon">
                <img
                  :src="`/icons/dialogue${game}/${npc}.webp`"
                  :alt="npc"
                  @error="handleImageError"
                />
              </div>
              <div class="npc-name">{{ npc }}</div>
            </router-link>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GAME_NAMES } from '@/utils/constants'
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import type { GameVersion } from '@/types/item'

const props = defineProps<{
  game: string
}>()

const npcList = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const gameNum = computed(() => Number(props.game) as GameVersion)

const title = computed(() => {
  return `${GAME_NAMES[gameNum.value]} - NPC对话`
})

// NPC 列表（根据实际数据文件）
const npcLists: Record<number, string[]> = {
  1: [
    'alvina',
    'anastacia',
    'andre',
    'artorias',
    'aside',
    'chester',
    'ciaran',
    'crestfallen',
    'darkmoon',
    'domhnall',
    'dusk',
    'eingyi',
    'elizabeth',
    'fortressknight',
    'frampt',
    'giantsmith',
    'gough',
    'griggs',
    'gwyndolin',
    'gwynevere',
    'ingward',
    'kaathe',
    'laurentius',
    'lautrec',
    'logan',
    'nest',
    'nico',
    'oscar',
    'oswald',
    'patches',
    'petrus',
    'quelana',
    'quelaag',
    'reah',
    'rhea',
    'rickert',
    'shiva',
    'sieglinde',
    'siegmeyer',
    'solaire',
    'undead',
    'vamos',
    'velka',
    'vince',
    'witch',
    'yulia'
  ],
  2: [
    'agdayne',
    'aldia',
    'alsanna',
    'ancient',
    'ashen',
    'aslatiel',
    'bashful',
    'bell',
    'benhart',
    'blacksmith',
    'blue',
    'bradley',
    'cale',
    'carhillion',
    'cat',
    'chancellor',
    'chloanne',
    'creighton',
    'cromwell',
    'darkdiver',
    'drummond',
    'dull',
    'emerald',
    'felkin',
    'fencer',
    'forlorn',
    'galvan',
    'gavlan',
    'gilligan',
    'grave',
    'head',
    'jester',
    'laddersmith',
    'lenigrast',
    'lonesome',
    'lucatiel',
    'magerold',
    'maughlin',
    'melinda',
    'merchant',
    'mild',
    'milibeth',
    'nashandra',
    'navlaan',
    'ornifex',
    'pate',
    'pilgrim',
    'rosabeth',
    'royal',
    'saulden',
    'shanalotte',
    'steady',
    'stone',
    'straid',
    'sweet',
    'titchy',
    'vendrick',
    'weaponsmith'
  ],
  3: [
    'andre',
    'anri',
    'archdeacon',
    'blacksmith',
    'cornyx',
    'corvian',
    'daughter',
    'eygon',
    'firekeeper',
    'giant',
    'greirat',
    'handmaid',
    'hawkwood',
    'horace',
    'irina',
    'karla',
    'knight',
    'lapp',
    'leonhard',
    'locust',
    'londor',
    'ludleth',
    'orbeck',
    'painter',
    'patches',
    'pilgrim',
    'ringfinger',
    'rosaria',
    'shira',
    'shrine',
    'siegward',
    'sirris',
    'slave',
    'stone',
    'unbreakable',
    'velka',
    'yoel',
    'yuria'
  ]
}

const loadNPCList = () => {
  loading.value = true
  error.value = null

  try {
    npcList.value = npcLists[gameNum.value] || []
  } catch (e) {
    error.value = '加载NPC列表失败'
    console.error('Failed to load NPC list:', e)
  } finally {
    loading.value = false
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadNPCList()
})
</script>

<style scoped lang="scss">
.dialogue-list-view {
  min-height: 100vh;
  background: #000;
}

.dialogue-list-layout {
  display: flex;
  padding-top: var(--nav-height, 110px);
  transition: padding-top 0.3s ease;

  @media (max-width: 1000px) {
    padding-top: var(--nav-height-mobile, 95px);
  }
}

.dialogue-list-main {
  flex: 1;
  min-width: 0;
}

.dialogue-list-container {
  padding: 2em;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1000px) {
    padding: 1em;
  }
}

.page-title {
  color: #960;
  font-size: 1.8em;
  margin: 0 0 1.5em 0;
  font-family: '仿宋', 'SimSun', serif;

  @media (max-width: 1000px) {
    font-size: 1.4em;
  }
}

.loading,
.error,
.empty {
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

  .error-message {
    color: #f66;
    margin: 1em 0;
    font-size: 0.9em;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.npc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5em;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1em;
  }
}

.npc-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5em 1em;
  background: #111;
  border: 1px solid #430;
  transition: 0.3s;
  text-decoration: none;
  box-shadow: inset 0 0 0.3em 0.1em #531;

  &:hover {
    border-color: #960;
    transform: translateY(-4px);
    box-shadow:
      0 4px 12px rgba(153, 102, 0, 0.3),
      inset 0 0 0.3em 0.1em #531;
  }

  .npc-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border: 1px solid #430;
    border-radius: 50%;
    overflow: hidden;

    @media (max-width: 1000px) {
      width: 64px;
      height: 64px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .npc-name {
    color: #fe6;
    font-size: 1em;
    font-family: 'Palatino Linotype', serif;
    text-align: center;
    text-transform: capitalize;
    font-weight: 700;

    @media (max-width: 1000px) {
      font-size: 0.9em;
    }
  }
}
</style>
