<template>
  <WikiLayout>
    <h2 class="page-title">我的收藏</h2>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="favoriteItems.length === 0" class="empty">
      <p class="empty-icon">📌</p>
      <p>还没有收藏任何物品</p>
      <router-link to="/ds1/weapon" class="browse-link">去浏览物品</router-link>
    </div>

    <div v-else class="favorites-content">
      <div class="favorites-header">
        <p class="item-count">共 {{ favoriteItems.length }} 项收藏</p>
        <button class="clear-btn" @click="clearAll">清空收藏</button>
      </div>

      <div class="table-wrapper">
        <table class="favorites-table">
          <thead>
            <tr>
              <th class="icon-col">图标</th>
              <th class="name-col">名称</th>
              <th class="game-col">游戏</th>
              <th class="type-col">类型</th>
              <th class="action-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in favoriteItems" :key="itemKey(item)" class="table-row">
              <td class="icon-cell">
                <img :src="`/icons/${item.icon}`" :alt="item.name.chn" />
              </td>
              <td class="name-cell">
                <router-link :to="getItemLink(item)" class="item-link">
                  {{ item.name.chn }}
                </router-link>
              </td>
              <td class="game-cell">{{ getGameName(item) }}</td>
              <td class="type-cell">{{ getTypeName(item) }}</td>
              <td class="action-cell">
                <button class="remove-btn" @click="removeFavorite(item)">移除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </WikiLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { GAME_NAMES, ITEM_TYPE_NAMES } from '@/utils/constants'
import { dataService, itemKey } from '@/services/dataService'
import WikiLayout from '@/components/layout/WikiLayout.vue'
import type { Item } from '@/types/item'

const userStore = useUserStore()
const loading = ref(true)
const allItems = ref<Item[]>([])

const favoriteItems = computed(() => {
  return allItems.value.filter((item) => userStore.isFavorite(item))
})

const loadFavorites = async () => {
  loading.value = true

  try {
    // 统一走 dataService，模块级缓存避免重复全量加载
    allItems.value = await dataService.getAllItems()
  } catch (error) {
    console.error('Failed to load favorites:', error)
  } finally {
    loading.value = false
  }
}

const getGameName = (item: Item) => {
  return GAME_NAMES[item.game] || '未知'
}

const getTypeName = (item: Item) => {
  return ITEM_TYPE_NAMES[item.type] || '未知'
}

const getItemLink = (item: Item) => {
  return `/ds${item.game}/${item.type}/${item.id}`
}

const removeFavorite = (item: Item) => {
  userStore.removeFavorite(item)
}

const clearAll = () => {
  if (confirm('确定要清空所有收藏吗？')) {
    favoriteItems.value.forEach((item) => {
      userStore.removeFavorite(item)
    })
  }
}

onMounted(() => {
  loadFavorites()
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
.empty {
  text-align: center;
  padding: 4em 2em;
  color: var(--color-text-secondary);

  .loading-spinner {
    margin: 0 auto 1em;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .browse-link {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.75em 1.5em;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-accent);
    text-decoration: none;

    &:hover {
      border-color: var(--color-accent);
    }
  }
}

.favorites-content {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 1.5em;

  @media (max-width: 768px) {
    padding: 1em;
  }
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25em;

  .item-count {
    color: var(--color-text-muted);
    font-size: 0.95em;
    margin: 0;
  }

  .clear-btn {
    padding: 0.45em 1.2em;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-red);
    cursor: pointer;

    &:hover {
      border-color: var(--color-red);
    }
  }
}

.table-wrapper {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.favorites-table {
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

      @media (max-width: 768px) {
        padding: 0.7em 0.6em;
        font-size: 0.85em;
      }
    }

    .icon-col {
      width: 64px;

      @media (max-width: 768px) {
        width: 52px;
      }
    }

    .name-col {
      width: 35%;
    }

    .game-col,
    .type-col {
      width: 15%;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .action-col {
      width: 90px;
      text-align: center;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--color-border-light);
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
      .item-link {
        color: var(--color-link);
        font-weight: 600;

        &:hover {
          color: var(--color-link-hover);
          text-decoration: underline;
        }
      }
    }

    .game-cell,
    .type-cell {
      color: var(--color-text-secondary);
      font-size: 0.92em;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .action-cell {
      text-align: center;

      .remove-btn {
        padding: 0.35em 1em;
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        color: var(--color-red);
        cursor: pointer;
        font-size: 0.88em;

        &:hover {
          border-color: var(--color-red);
          background: rgba(192, 57, 43, 0.08);
        }
      }
    }
  }
}
</style>
