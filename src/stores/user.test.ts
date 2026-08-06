import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { itemKey } from '@/services/dataService'
import type { Item } from '@/types/item'

// node 测试环境无 localStorage，提供最小实现供 userStore 持久化使用
const storage = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear()
})

/**
 * 构造测试物品：id 跨文件重复是真实数据特征（如 100 同时是 ds1-ring / ds1-item / ds3-item），
 * 收藏复合键需保证彼此独立、升级/移除不互相误伤。
 */
const makeItem = (game: Item['game'], type: Item['type'], id: string): Item =>
  ({ game, type, id, name: { chn: '', jap: '', eng: '' } }) as Item

describe('userStore 收藏复合键', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storage.clear()
  })

  it('toggleFavorite 添加时升级旧版纯 id 收藏', () => {
    const store = useUserStore()
    const item = makeItem(1, 'ring', '100')
    // 模拟旧版纯 id 收藏
    store.favorites.add('100')
    store.toggleFavorite(item)
    // 升级为复合键，旧纯 id 被移除
    expect(store.favorites.has(itemKey(item))).toBe(true)
    expect(store.favorites.has('100')).toBe(false)
  })

  it('toggleFavorite 不误删共用同一 id 的其他复合键收藏（核心回归）', () => {
    const store = useUserStore()
    const ring = makeItem(1, 'ring', '100')
    const item = makeItem(1, 'item', '100')
    // 已有 ring 的复合键收藏 + 旧版纯 id 收藏
    store.favorites.add(itemKey(ring))
    store.favorites.add('100')
    // 对 item 执行收藏（旧 id 同时代表 ring 和 item）
    store.toggleFavorite(item)
    // ring 的收藏不能被误删
    expect(store.favorites.has(itemKey(ring))).toBe(true)
    // item 新增复合键
    expect(store.favorites.has(itemKey(item))).toBe(true)
  })

  it('toggleFavorite 取消收藏后同步清理遗留纯 id（无其他同 id 复合键时）', () => {
    const store = useUserStore()
    const item = makeItem(1, 'ring', '100')
    store.favorites.add(itemKey(item))
    store.favorites.add('100')
    store.toggleFavorite(item) // 取消收藏
    expect(store.favorites.has(itemKey(item))).toBe(false)
    expect(store.favorites.has('100')).toBe(false)
  })

  it('toggleFavorite 取消一个收藏时保留其他同 id 复合键与纯 id（避免误删）', () => {
    const store = useUserStore()
    const ring = makeItem(1, 'ring', '100')
    const item = makeItem(1, 'item', '100')
    store.favorites.add(itemKey(ring))
    store.favorites.add(itemKey(item))
    store.favorites.add('100')
    // 取消 item 收藏
    store.toggleFavorite(item)
    expect(store.favorites.has(itemKey(item))).toBe(false)
    // ring 的复合键与旧纯 id 都应保留
    expect(store.favorites.has(itemKey(ring))).toBe(true)
    expect(store.favorites.has('100')).toBe(true)
  })

  it('removeFavorite 同时清理复合键与旧版纯 id（无孤儿残留）', () => {
    const store = useUserStore()
    const item = makeItem(1, 'ring', '100')
    store.favorites.add(itemKey(item))
    store.favorites.add('100')
    store.removeFavorite(item)
    expect(store.favorites.has(itemKey(item))).toBe(false)
    expect(store.favorites.has('100')).toBe(false)
  })

  it('toggleFavorite 升级时不会误伤同前缀 id（:100 不影响 :1000）', () => {
    const store = useUserStore()
    const a = makeItem(1, 'ring', '100')
    const b = makeItem(1, 'item', '1000')
    store.favorites.add(itemKey(b))
    store.favorites.add('1000')
    // 收藏 id=100 的物品，不应删除 id=1000 的复合键或纯 id
    store.toggleFavorite(a)
    expect(store.favorites.has(itemKey(b))).toBe(true)
    expect(store.favorites.has('1000')).toBe(true)
  })

  it('isFavorite 兼容复合键与旧版纯 id', () => {
    const store = useUserStore()
    const item = makeItem(1, 'ring', '100')
    store.favorites.add('100')
    expect(store.isFavorite(item)).toBe(true)
    store.favorites.clear()
    store.favorites.add(itemKey(item))
    expect(store.isFavorite(item)).toBe(true)
  })
})
