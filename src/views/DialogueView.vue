<template>
  <WikiLayout>
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
  </WikiLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GAME_NAMES } from '@/utils/constants'
import { dataService } from '@/services/dataService'
import WikiLayout from '@/components/layout/WikiLayout.vue'
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
.page-title {
  color: var(--color-text);
  font-size: 1.7em;
  font-weight: 700;
  margin: 0 0 1.25em;

  @media (max-width: 768px) {
    font-size: 1.3em;
  }
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 4em 2em;
  color: var(--color-text-secondary);

  .loading-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 1em;
  }

  .error-message {
    color: var(--color-red);
    margin: 1em 0;
    font-size: 0.9em;
  }

  .retry-btn,
  .back-link {
    display: inline-block;
    margin-top: 1em;
    padding: 0.75em 1.5em;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-accent);
    cursor: pointer;
    text-decoration: none;

    &:hover {
      border-color: var(--color-accent);
    }
  }
}
</style>
