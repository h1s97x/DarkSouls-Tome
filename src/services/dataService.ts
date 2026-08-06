import {
  clearDataCache,
  getNPCList,
  loadAllItems,
  loadDialogue,
  loadItems
} from '@/services/dataLoader'
import type { Dialogue, GameVersion, Item, ItemType } from '@/types/item'
import { ItemQuery, itemKey } from '@/services/itemQuery'
import type { ItemQueryResult, ItemSort, SearchLanguage } from '@/services/itemQuery'

export const GAMES: GameVersion[] = [1, 2, 3]
export const ITEM_TYPES: ItemType[] = ['weapon', 'armor', 'ring', 'item', 'magic']

/**
 * 物品复合键（game:type:id）单一来源在 itemQuery.ts
 * 同一 id 可能跨文件重复（如 100 同时是 ds1-ring / ds1-item / ds3-item），
 * 用复合键可精确定位到唯一物品。此处 re-export 保持历史导入路径兼容。
 */
export { itemKey }

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

  /** 根据收藏 id 集合过滤出对应物品（同一 id 可能跨文件重复，返回全部匹配） */
  getFavoriteItems: async (ids: string[]): Promise<Item[]> => {
    const all = await loadAllItems()
    return all.filter((item) => ids.includes(item.id))
  },

  /** 根据收藏复合键集合（game:type:id）过滤出精确对应的物品 */
  getFavoriteItemsByKey: async (keys: string[]): Promise<Item[]> => {
    const all = await loadAllItems()
    return all.filter((item) => keys.includes(itemKey(item)))
  },

  // ---- 对话 ----

  /** 加载某游戏某 NPC 的对话 */
  getDialogue: (game: GameVersion, npc: string): Promise<Dialogue> => loadDialogue(game, npc),

  /** 加载某游戏的全部 NPC 列表（数据驱动，由索引文件派生） */
  getNPCList: (game: GameVersion): Promise<string[]> => getNPCList(game),

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
  },
  // ---- 查询能力（阶段 3：参考 eldenring-api 的 JSONDriver） ----

  /**
   * 统一搜索：跨语言关键字匹配物品名称/描述/备注（归一化后匹配）
   * @param keyword 搜索关键字
   * @param options 可选：language 限定语言、sort 排序、page/pageSize 分页
   */
  searchItems: async (
    keyword: string,
    options: {
      language?: SearchLanguage
      sort?: ItemSort
      page?: number
      pageSize?: number
    } = {}
  ): Promise<ItemQueryResult> => {
    const all = await loadAllItems()
    let query = ItemQuery.from(all)
    query = options.language ? query.searchIn(options.language, keyword) : query.search(keyword)
    if (options.sort) query = query.sortBy(options.sort)
    return query.paginate(options.page ?? 1, options.pageSize ?? Infinity)
  },

  /**
   * 获取指定物品的相关物品（同游戏同类型下随机取若干，排除自身）
   */
  getRelatedItems: async (item: Item, count = 8): Promise<Item[]> => {
    const sameGame = await loadItems(item.game, item.type)
    const others = ItemQuery.from(sameGame)
      .excludeKeys([itemKey(item)])
      .paginate(1, sameGame.length).items
    // 洗牌后取前 count 个，保持原版“随机相关推荐”行为
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[others[i], others[j]] = [others[j]!, others[i]!]
    }
    return others.slice(0, count)
  }
}

/** 清空数据缓存（开发期 / 测试用） */
export { clearDataCache }

export type { ItemQueryResult, ItemSort, SearchLanguage }
