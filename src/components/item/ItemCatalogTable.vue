<template>
  <div class="item-catalog-table">
    <div class="table-header">
      <h2 class="page-title">{{ title }}</h2>
      <div class="table-controls">
        <input v-model="searchQuery" type="text" placeholder="搜索物品…" class="search-input" />
        <span class="item-count">共 {{ filteredItems.length }} 项</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="$emit('retry')">重试</button>
    </div>

    <div v-else-if="filteredItems.length === 0" class="empty">
      <p>没有找到物品</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="icon-col">图标</th>
            <th class="name-col">名称</th>
            <th class="desc-col">描述</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredItems"
            :key="itemKey(item)"
            class="table-row"
            @click="goToDetail(item.id)"
          >
            <td class="icon-cell">
              <LazyImage :src="`/icons/${item.icon}`" :alt="displayName(item)" />
            </td>
            <td class="name-cell">
              <span class="name-text" v-html="highlightedName(item)"></span>
            </td>
            <td class="desc-cell">
              <span class="desc-text" v-html="highlightedDesc(item)"></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LazyImage from '@/components/common/LazyImage.vue'
import { ItemQuery, itemKey } from '@/services/itemQuery'
import { highlightText, normalizeForSearch, stripFormatting } from '@/utils/formatter'
import type { Item } from '@/types/item'

const props = defineProps<{
  items: Item[]
  title: string
  game: number
  type: string
  loading?: boolean
  error?: string
}>()

defineEmits<{
  retry: []
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const searchQuery = ref('')

// 支持从首页搜索框带 ?q= 参数进入
onMounted(() => {
  const q = typeof route.query.q === 'string' ? route.query.q : ''
  if (q) {
    searchQuery.value = q
  }
})

const displayName = (item: Item) => {
  return item.name[userStore.currentLanguage]
}

const displayDescription = (item: Item) => {
  return item.description[userStore.currentLanguage]
}

/** 过滤逻辑统一收口到 ItemQuery 查询引擎（阶段 3） */
const filteredItems = computed(() => {
  return ItemQuery.from(props.items).search(searchQuery.value).paginate(1, Infinity).items
})

/** 名称高亮 */
const highlightedName = (item: Item) => {
  return highlightText(stripFormatting(displayName(item)), searchQuery.value)
}

/** 描述高亮（截断前 80 字） */
const highlightedDesc = (item: Item) => {
  const desc = displayDescription(item)
  const plain = normalizeForSearch(desc)
  const truncated = plain.length > 80 ? plain.substring(0, 80) + '...' : plain
  return highlightText(truncated, searchQuery.value)
}

const goToDetail = (id: string) => {
  router.push(`/ds${props.game}/${props.type}/${id}`)
}
</script>

<style scoped lang="scss">
.item-catalog-table {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.25em;
  flex-wrap: wrap;
  gap: 1em;
}

.page-title {
  color: var(--color-text);
  font-size: 1.7em;
  font-weight: 700;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.3em;
  }
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 0.8em;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.search-input {
  padding: 0.55em 1em;
  border-radius: 8px;
  min-width: 260px;
  font-size: 0.95em;

  @media (max-width: 768px) {
    flex: 1;
    min-width: 0;
  }
}

.item-count {
  color: var(--color-text-muted);
  font-size: 0.9em;
  white-space: nowrap;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 4em 2em;
  color: var(--color-text-secondary);

  .loading-spinner {
    margin: 0 auto 1em;
  }

  button {
    margin-top: 1em;
    padding: 0.5em 2em;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-accent);
    cursor: pointer;

    &:hover {
      border-color: var(--color-accent);
    }
  }
}

.table-wrapper {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: var(--color-bg-tertiary);

    th {
      padding: 0.85em 1em;
      text-align: left;
      color: var(--color-text-secondary);
      border-bottom: 2px solid var(--color-border);
      font-weight: 700;
      font-size: 0.9em;
      white-space: nowrap;

      @media (max-width: 768px) {
        padding: 0.7em 0.6em;
      }
    }

    .icon-col {
      width: 64px;

      @media (max-width: 768px) {
        width: 52px;
      }
    }

    .name-col {
      width: 26%;

      @media (max-width: 768px) {
        width: 40%;
      }
    }

    .desc-col {
      width: auto;

      @media (max-width: 768px) {
        display: none;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--color-border-light);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--color-bg-hover);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 0.8em 1em;
      color: var(--color-text);
      vertical-align: middle;

      @media (max-width: 768px) {
        padding: 0.65em 0.6em;
      }
    }

    .icon-cell {
      img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        display: block;

        @media (max-width: 768px) {
          width: 38px;
          height: 38px;
        }
      }
    }

    .name-cell {
      .name-text {
        font-weight: 700;
        color: var(--color-text);
        font-size: 1em;

        :deep(mark) {
          background: var(--color-mark);
          color: inherit;
          border-radius: 3px;
          padding: 0 0.15em;
        }
      }
    }

    .desc-cell {
      @media (max-width: 768px) {
        display: none;
      }

      .desc-text {
        color: var(--color-text-secondary);
        font-size: 0.92em;
        line-height: 1.6;
        display: block;
        max-width: 720px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        :deep(mark) {
          background: var(--color-mark);
          color: inherit;
          border-radius: 3px;
          padding: 0 0.15em;
        }
      }
    }
  }
}
</style>
