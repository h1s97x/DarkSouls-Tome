<template>
  <div class="dialogue-view">
    <ImprovedNavigation />
    <div class="dialogue-layout">
      <SidebarNav />
      <main class="dialogue-main">
        <div class="dialogue-container">
          <h2 class="page-title">{{ title }}</h2>

          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="error" class="error">
            <p>❌ 加载失败</p>
            <p class="error-message">{{ error.message }}</p>
            <button class="retry-btn" @click="loadDialogue">重试</button>
          </div>

          <div v-else-if="!dialogue" class="empty">
            <p>未找到对话数据</p>
            <router-link :to="`/ds${game}/dialogue`" class="back-link">返回对话列表</router-link>
          </div>

          <DialogueCard v-else :dialogue="dialogue" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GAME_NAMES } from '@/utils/constants'
import { dataService } from '@/services/dataService'
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import DialogueCard from '@/components/dialogue/DialogueCard.vue'
import type { Dialogue, GameVersion } from '@/types/item'

const props = defineProps<{
  game: string
  npc: string
}>()

const dialogue = ref<Dialogue | null>(null)
const loading = ref(false)
const error = ref<Error | null>(null)

const gameNum = computed(() => Number(props.game) as GameVersion)

const title = computed(() => {
  return `${GAME_NAMES[gameNum.value]} - ${props.npc}`
})

const loadDialogue = async () => {
  loading.value = true
  error.value = null

  try {
    dialogue.value = await dataService.getDialogue(gameNum.value, props.npc)
  } catch (e) {
    error.value = e as Error
    console.error(`Failed to load dialogue for ${props.npc}:`, e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDialogue()
})
</script>

<style scoped lang="scss">
.dialogue-view {
  min-height: 100vh;
  background: #000;
}

.dialogue-layout {
  display: flex;
  padding-top: var(--nav-height, 110px);
  transition: padding-top 0.3s ease;

  @media (max-width: 1000px) {
    padding-top: var(--nav-height-mobile, 95px);
  }
}

.dialogue-main {
  flex: 1;
  min-width: 0;
}

.dialogue-container {
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

  .retry-btn,
  .back-link {
    display: inline-block;
    margin-top: 1em;
    padding: 0.75em 1.5em;
    background: #111;
    border: 1px solid #430;
    color: #960;
    cursor: pointer;
    transition: 0.3s;
    font-family: '仿宋', 'SimSun', serif;
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
</style>
