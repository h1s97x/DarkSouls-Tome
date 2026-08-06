import { clearDataCache, loadAllItems, loadDialogue, loadItems } from '@/services/dataLoader'
import type { Dialogue, GameVersion, Item, ItemType } from '@/types/item'

export const GAMES: GameVersion[] = [1, 2, 3]
export const ITEM_TYPES: ItemType[] = ['weapon', 'armor', 'ring', 'item', 'magic']

/**
 * 统一数据服务：视图/组合式函数唯一数据入口，不再直接 import() JSON。
 * 参考 eldenring-api 的 JSONLoader + JSONDriver 分层，静态 JSON 为唯一事实源。
 */
export const dataService = {
  // ---- 物品 ----

  /** 加载某游戏某类型的物品列表 */
  getItems: (game: GameVersion, type: ItemType): Promise<Item[]> => loadItems(game, type),

  /** 按 id 查询单个物品 */
  getItemById: async (game: GameVersion, type: ItemType, id: string): Promise<Item | undefined> =>
    (await loadItems(game, type)).find((item) => item.id === id),

  /** 加载全部物品（收藏页等场景，模块级缓存） */
  getAllItems: (): Promise<Item[]> => loadAllItems(),

  /** 根据收藏 id 集合过滤出对应物品 */
  getFavoriteItems: async (ids: string[]): Promise<Item[]> => {
    const all = await loadAllItems()
    return all.filter((item) => ids.includes(item.id))
  },

  // ---- 对话 ----

  /** 加载某游戏某 NPC 的对话 */
  getDialogue: (game: GameVersion, npc: string): Promise<Dialogue> => loadDialogue(game, npc),

  // ---- 元数据（数据驱动，替代过期常量） ----

  /** 统计各游戏各类型的物品数量，由数据动态派生，杜绝手写漂移 */
  getItemCounts: async (): Promise<Record<GameVersion, Record<ItemType, number>>> => {
    const items = await loadAllItems()
    const counts: Record<GameVersion, Record<ItemType, number>> = {
      1: { weapon: 0, armor: 0, ring: 0, item: 0, magic: 0 },
      2: { weapon: 0, armor: 0, ring: 0, item: 0, magic: 0 },
      3: { weapon: 0, armor: 0, ring: 0, item: 0, magic: 0 }
    }
    for (const item of items) {
      counts[item.game][item.type]++
    }
    return counts
  }
}

/** 清空数据缓存（开发期 / 测试用） */
export { clearDataCache }
