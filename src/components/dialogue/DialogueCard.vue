<template>
  <div class="dialogue-card">
    <div class="dialogue-header">
      <div class="npc-avatar">
        <LazyImage :src="avatarPath" :alt="dialogue.npc" />
      </div>
      <div class="npc-info">
        <h3 class="npc-name">{{ dialogue.npc }}</h3>
        <span class="npc-meta">对话记录 · {{ dialogue.lines.length }} 行</span>
      </div>
    </div>

    <div class="dialogue-lines">
      <div
        v-for="line in dialogue.lines"
        :key="line.index"
        class="dialogue-line"
        :class="{
          'is-title': line.isTitle,
          'is-unused': line.isUnused
        }"
      >
        <span class="line-index">{{ line.index }}</span>
        <p class="line-text">{{ getLineText(line) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import LazyImage from '@/components/common/LazyImage.vue'
import type { Dialogue, DialogueLine } from '@/types/item'

const props = defineProps<{
  dialogue: Dialogue
}>()

const userStore = useUserStore()

const avatarPath = computed(() => {
  return props.dialogue.avatar
})

const getLineText = (line: DialogueLine) => {
  return line[userStore.currentLanguage]
}
</script>

<style scoped lang="scss">
.dialogue-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: 1.5em;
}

.dialogue-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 2rem;
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    gap: 1rem;
  }
}

.npc-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-accent-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
}

.npc-name {
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 0;
  font-weight: 700;
  text-transform: capitalize;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
}

.npc-meta {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.dialogue-lines {
  padding: 0.5rem 2rem 1.5rem;

  @media (max-width: 768px) {
    padding: 0.25rem 1.25rem 1rem;
  }
}

.dialogue-line {
  display: flex;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px dashed var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }

  &.is-title {
    background: var(--color-accent-soft);
    padding: 1rem;
    margin: 0.75rem 0;
    border: 1px solid var(--color-accent-border);
    border-radius: 8px;

    .line-text {
      font-weight: 700;
      color: var(--color-accent-strong);
    }
  }

  &.is-unused {
    opacity: 0.45;

    .line-text {
      text-decoration: line-through;
      font-style: italic;
    }
  }
}

.line-index {
  flex-shrink: 0;
  width: 44px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  text-align: right;
  padding-top: 0.2rem;
}

.line-text {
  flex: 1;
  color: var(--color-text);
  line-height: 1.8;
  margin: 0;
  font-size: 1rem;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .dialogue-header {
    flex-direction: row;
  }

  .dialogue-line {
    flex-direction: column;
    gap: 0.3rem;
  }

  .line-index {
    width: auto;
    text-align: left;
  }

  .line-text {
    font-size: 0.95rem;
  }
}
</style>
