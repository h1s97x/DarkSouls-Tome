<template>
  <WikiLayout>
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
            :src="`/icons/ds${game}/dialogues/${npc}.webp`"
            :alt="npc"
            @error="handleImageError"
          />
        </div>
        <div class="npc-name">{{ npc }}</div>
      </router-link>
    </div>
  </WikiLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GAME_NAMES } from '@/utils/constants'
import { dataService } from '@/services/dataService'
import WikiLayout from '@/components/layout/WikiLayout.vue'
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

// NPC 列表由数据索引驱动（src/data/dialogueIndex.json）
const loadNPCList = async () => {
  loading.value = true
  error.value = null

  try {
    npcList.value = await dataService.getNPCList(gameNum.value)
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
}

.npc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25em;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.9em;
  }
}

.npc-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5em 1em 1.25em;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: var(--color-text);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: var(--color-accent-border);
    text-decoration: none;
    color: var(--color-text);
  }

  .npc-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 0.9em;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-tertiary);
    border: 2px solid var(--color-border);
    border-radius: 50%;
    overflow: hidden;

    @media (max-width: 768px) {
      width: 60px;
      height: 60px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .npc-name {
    color: var(--color-text);
    font-size: 0.95em;
    text-align: center;
    text-transform: capitalize;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 0.85em;
    }
  }
}
</style>
