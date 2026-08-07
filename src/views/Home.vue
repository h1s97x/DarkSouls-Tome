<template>
  <WikiContainer>
    <div class="home-hero">
      <h1 class="hero-title">
        <span class="hero-title-en">Dark Souls</span>
        黑暗之魂系列文本数据库
      </h1>
      <p class="hero-sub">汇集黑暗之魂 1 / 2 / 3 的物品、武器、防具、戒指、法术与 NPC 对话</p>

      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          class="search-input"
          placeholder="搜索物品 / 武器 / 防具 / 法术…（支持中日英三语）"
          @keyup.enter="doSearch"
        />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
    </div>

    <div class="home-content">
      <!-- 游戏分区：分类卡片 -->
      <section v-for="game in games" :key="game.id" class="game-section">
        <h2 class="section-title">
          <router-link :to="`/ds${game.id}/weapon`">{{ game.name }}</router-link>
        </h2>
        <div class="category-grid">
          <router-link
            v-for="cat in categories"
            :key="cat.type"
            :to="`/ds${game.id}/${cat.type}`"
            class="category-card"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ getCount(game.id, cat.type) }} 项</span>
          </router-link>
        </div>
      </section>
    </div>
  </WikiContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WikiContainer from '@/components/layout/WikiContainer.vue'
import { dataService } from '@/services/dataService'
import type { ItemType } from '@/types/item'

const router = useRouter()
const keyword = ref('')

const games = [
  { id: 1, name: '黑暗之魂' },
  { id: 2, name: '黑暗之魂2' },
  { id: 3, name: '黑暗之魂3' }
]

const categories: { type: ItemType; name: string; icon: string }[] = [
  { type: 'weapon', name: '武器', icon: '⚔️' },
  { type: 'armor', name: '防具', icon: '🛡️' },
  { type: 'ring', name: '戒指', icon: '💍' },
  { type: 'item', name: '物品', icon: '📦' },
  { type: 'magic', name: '法术', icon: '✨' }
]

const counts = ref<Record<number, Record<ItemType, number>>>({
  1: { weapon: 0, armor: 0, ring: 0, item: 0, magic: 0 },
  2: { weapon: 0, armor: 0, ring: 0, item: 0, magic: 0 },
  3: { weapon: 0, armor: 0, ring: 0, item: 0, magic: 0 }
})

const getCount = (game: number, type: ItemType) => {
  return counts.value[game]?.[type] ?? 0
}

const loadCounts = async () => {
  try {
    counts.value = await dataService.getItemCounts()
  } catch (e) {
    console.error('Failed to load item counts:', e)
  }
}

const doSearch = () => {
  const q = keyword.value.trim()
  if (!q) return
  router.push(`/ds1/weapon?q=${encodeURIComponent(q)}`)
}

onMounted(() => {
  loadCounts()
})
</script>

<style scoped lang="scss">
.home-hero {
  text-align: center;
  padding: 2.5em 1em 2em;

  @media (max-width: 768px) {
    padding: 1.5em 0.5em 1.25em;
  }
}

.hero-title {
  font-family: 'Palatino Linotype', Georgia, 'Times New Roman', 'Songti SC', serif;
  font-size: 2.4em;
  font-weight: 700;
  color: var(--color-text);

  @media (max-width: 768px) {
    font-size: 1.6em;
  }
}

.hero-title-en {
  display: block;
  font-size: 0.72em;
  color: var(--color-accent);
  letter-spacing: 0.08em;
  margin-bottom: 0.2em;
}

.hero-sub {
  margin-top: 0.6em;
  color: var(--color-text-secondary);
  font-size: 1.05em;

  @media (max-width: 768px) {
    font-size: 0.95em;
  }
}

.search-box {
  display: flex;
  max-width: 620px;
  margin: 1.8em auto 0;
  gap: 0.5em;

  @media (max-width: 768px) {
    margin-top: 1.2em;
    flex-direction: column;
  }
}

.search-input {
  flex: 1;
  padding: 0.75em 1.1em;
  border-radius: 8px;
  font-size: 1em;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
}

.search-btn {
  padding: 0.75em 2em;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 700;
  font-size: 1em;

  &:hover {
    filter: brightness(1.08);
  }

  @media (max-width: 768px) {
    padding: 0.7em;
  }
}

.home-content {
  margin-top: 1.5em;
}

.game-section {
  margin-bottom: 2.5em;
}

.section-title {
  font-size: 1.5em;
  margin-bottom: 1em;
  padding-bottom: 0.4em;
  border-bottom: 1px solid var(--color-border);

  a {
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: none;
    }
  }

  @media (max-width: 768px) {
    font-size: 1.25em;
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1em;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75em;
  }
}

.category-card {
  display: flex;
  align-items: center;
  gap: 0.8em;
  padding: 1em 1.1em;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  color: var(--color-text);
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
    border-color: var(--color-accent-border);
    text-decoration: none;
    color: var(--color-text);
  }

  .category-icon {
    font-size: 1.5em;
    flex-shrink: 0;
  }

  .category-name {
    font-weight: 700;
    font-size: 1.05em;
  }

  .category-count {
    margin-left: auto;
    font-size: 0.8em;
    color: var(--color-text-muted);
    background: var(--color-bg-tertiary);
    padding: 0.2em 0.6em;
    border-radius: 999px;
    white-space: nowrap;
  }
}
</style>
