<template>
  <div class="item-catalog-table">
    <div class="table-header">
      <h2>{{ title }}</h2>
      <div class="table-controls">
        <input v-model="searchQuery" type="text" placeholder="搜索物品..." class="search-input" />
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

    <table v-else class="catalog-table">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const userStore = useUserStore()
const searchQuery = ref('')

const displayName = (item: Item) => {
  return item.name[userStore.currentLanguage]
}

const displayDescription = (item: Item) => {
  return item.description[userStore.currentLanguage]
}

/**
 * 过滤逻辑统一收口到 ItemQuery 查询引擎（阶段 3）
 * 跨语言匹配名称/描述/备注，归一化（去格式标记 + 大小写不敏感）后命中。
 */
const filteredItems = computed(() => {
  return ItemQuery.from(props.items).search(searchQuery.value).paginate(1, Infinity).items
})

/** 名称高亮（搜索关键词命中时显示 <mark>，先剥离格式标记避免残留 ## 等） */
const highlightedName = (item: Item) => {
  return highlightText(stripFormatting(displayName(item)), searchQuery.value)
}

/** 描述高亮（截断前 80 字，命中关键词处高亮） */
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
  padding: 2em;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1000px) {
    padding: 1em;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2em;
  flex-wrap: wrap;
  gap: 1em;

  h2 {
    color: #960;
    font-size: 1.8em;
    margin: 0;
    font-family: '仿宋', 'SimSun', serif;

    @media (max-width: 1000px) {
      font-size: 1.4em;
    }
  }

  .table-controls {
    display: flex;
    align-items: center;
    gap: 1em;

    @media (max-width: 1000px) {
      width: 100%;
    }
  }

  .search-input {
    padding: 0.6em 1em;
    background: #111;
    border: 1px solid #430;
    color: #ccc;
    font-size: 1em;
    font-family: '仿宋', 'SimSun', serif;
    min-width: 250px;
    transition: 0.3s;

    &:focus {
      border-color: #960;
      outline: none;
    }

    &::placeholder {
      color: #666;
    }

    @media (max-width: 1000px) {
      flex: 1;
      min-width: 0;
    }
  }

  .item-count {
    color: #aaa;
    font-size: 0.9em;
    white-space: nowrap;
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
    margin: 0 auto 1em;
  }

  button {
    margin-top: 1em;
    padding: 0.5em 2em;
    background: #111;
    border: 1px solid #430;
    color: #960;
    font-family: '仿宋', 'SimSun', serif;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      border-color: #960;
      background: #222;
    }
  }
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;
  background: #111;
  box-shadow: inset 0 0 0.3em 0.1em #531;

  thead {
    background: #222;
    position: sticky;
    top: 150px;
    z-index: 10;

    @media (max-width: 1000px) {
      top: 6em;
    }

    th {
      padding: 1em;
      text-align: left;
      color: #960;
      border-bottom: 2px solid #430;
      font-weight: 700;
      font-family: '仿宋', 'SimSun', serif;
      font-size: 1.1em;

      @media (max-width: 1000px) {
        padding: 0.75em 0.5em;
        font-size: 1em;
      }
    }

    .icon-col {
      width: 80px;

      @media (max-width: 1000px) {
        width: 60px;
      }
    }

    .name-col {
      width: 25%;

      @media (max-width: 1000px) {
        width: 35%;
      }
    }

    .desc-col {
      width: auto;

      @media (max-width: 1000px) {
        display: none;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #321;
      cursor: pointer;
      transition: 0.3s;

      &:hover {
        background: rgba(153, 102, 0, 0.1);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 1em;
      color: #ccc;
      vertical-align: middle;

      @media (max-width: 1000px) {
        padding: 0.75em 0.5em;
      }
    }

    .icon-cell {
      img {
        width: 48px;
        height: 48px;
        object-fit: contain;
        display: block;

        @media (max-width: 1000px) {
          width: 40px;
          height: 40px;
        }
      }
    }

    .name-cell {
      .name-text {
        font-weight: 700;
        color: #fe6;
        font-size: 1.05em;
        font-family: '仿宋', 'SimSun', serif;

        @media (max-width: 1000px) {
          font-size: 1em;
        }
      }

      :deep(mark) {
        background: rgba(153, 102, 0, 0.4);
        color: #fe6;
        padding: 0 0.1em;
      }
    }

    .desc-cell {
      @media (max-width: 1000px) {
        display: none;
      }

      .desc-text {
        color: #999;
        font-size: 0.95em;
        line-height: 1.6;

        :deep(mark) {
          background: rgba(153, 102, 0, 0.4);
          color: #fe6;
          padding: 0 0.1em;
        }
      }
    }
  }
}
</style>
