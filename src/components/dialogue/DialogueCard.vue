<template>
  <div class="dialogue-card">
    <div class="dialogue-header">
      <div class="npc-avatar">
        <LazyImage :src="avatarPath" :alt="dialogue.npc" />
      </div>
      <h3 class="npc-name">{{ dialogue.npc }}</h3>
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
  background: #111;
  border: 1px solid #321;
  box-shadow: inset 0 0 20px #531;
  overflow: hidden;
}

.dialogue-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #000;
  border-bottom: 2px solid #321;
}

.npc-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #960;
  background: #000;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.npc-name {
  font-size: 1.8rem;
  color: #960;
  margin: 0;
  font-family: '仿宋', 'SimSun', serif;
  font-weight: normal;
}

.dialogue-lines {
  padding: 1.5rem;
}

.dialogue-line {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #321;

  &:last-child {
    border-bottom: none;
  }

  &.is-title {
    background: rgba(153, 102, 0, 0.1);
    padding: 1rem;
    margin: 0.5rem 0;
    border: 1px solid #430;

    .line-text {
      font-weight: bold;
      color: #fe6;
    }
  }

  &.is-unused {
    opacity: 0.4;

    .line-text {
      text-decoration: line-through;
      font-style: italic;
    }
  }
}

.line-index {
  flex-shrink: 0;
  width: 50px;
  color: #666;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  text-align: right;
}

.line-text {
  flex: 1;
  color: #ccc;
  line-height: 1.8;
  margin: 0;
  font-family: '仿宋', 'SimSun', serif;
  font-size: 1.05rem;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .dialogue-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .npc-avatar {
    width: 64px;
    height: 64px;
  }

  .npc-name {
    font-size: 1.4rem;
  }

  .dialogue-lines {
    padding: 1rem;
  }

  .dialogue-line {
    flex-direction: column;
    gap: 0.5rem;
  }

  .line-index {
    width: auto;
    text-align: left;
  }

  .line-text {
    font-size: 1rem;
  }
}
</style>
