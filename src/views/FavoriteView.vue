<template>
  <div class="favorite-view">
    <ImprovedNavigation />
    <div class="favorite-layout">
      <SidebarNav />
      <main class="favorite-main">
        <div class="favorite-container">
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
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { GAME_NAMES, ITEM_TYPE_NAMES } from '@/utils/constants'
import { dataService, itemKey } from '@/services/dataService'
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
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
.favorite-view {
  min-height: 100vh;
  background: #000;
}

.favorite-layout {
  display: flex;
  padding-top: var(--nav-height, 110px);
  transition: padding-top 0.3s ease;

  @media (max-width: 1000px) {
    padding-top: var(--nav-height-mobile, 95px);
  }
}

.favorite-main {
  flex: 1;
  min-width: 0;
}

.favorite-container {
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
.empty {
  text-align: center;
  padding: 4em 2em;
  color: #ccc;
  font-family: '仿宋', 'SimSun', serif;

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
    background: #111;
    border: 1px solid #430;
    color: #960;
    text-decoration: none;
    transition: 0.3s;
    font-family: '仿宋', 'SimSun', serif;

    &:hover {
      border-color: #960;
      background: #222;
    }
  }
}

.favorites-content {
  background: #111;
  padding: 1.5em;
  box-shadow: inset 0 0 0.3em 0.1em #531;

  @media (max-width: 1000px) {
    padding: 1em;
  }
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
  padding-bottom: 1em;
  border-bottom: 1px solid #430;

  .item-count {
    color: #aaa;
    font-size: 0.95em;
    margin: 0;
  }

  .clear-btn {
    padding: 0.5em 1.5em;
    background: #222;
    border: 1px solid #430;
    color: #f66;
    cursor: pointer;
    transition: 0.3s;
    font-family: '仿宋', 'SimSun', serif;

    &:hover {
      border-color: #f66;
      background: #333;
    }
  }
}

.favorites-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #222;

    th {
      padding: 1em;
      text-align: left;
      color: #960;
      border-bottom: 2px solid #430;
      font-weight: 700;
      font-family: '仿宋', 'SimSun', serif;

      @media (max-width: 1000px) {
        padding: 0.75em 0.5em;
        font-size: 0.9em;
      }
    }

    .icon-col {
      width: 80px;

      @media (max-width: 1000px) {
        width: 60px;
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
      width: 100px;
      text-align: center;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #321;
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
      .item-link {
        color: #fe6;
        font-weight: 700;
        font-family: '仿宋', 'SimSun', serif;
        transition: 0.3s;

        &:hover {
          color: #960;
          text-decoration: underline;
        }
      }
    }

    .game-cell,
    .type-cell {
      color: #aaa;
      font-size: 0.95em;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .action-cell {
      text-align: center;

      .remove-btn {
        padding: 0.4em 1em;
        background: transparent;
        border: 1px solid #430;
        color: #f66;
        cursor: pointer;
        transition: 0.3s;
        font-family: '仿宋', 'SimSun', serif;
        font-size: 0.9em;

        &:hover {
          border-color: #f66;
          background: rgba(255, 102, 102, 0.1);
        }
      }
    }
  }
}
</style>
