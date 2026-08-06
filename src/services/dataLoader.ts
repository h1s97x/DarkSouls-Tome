import type { Dialogue, GameVersion, Item, ItemType } from '@/types/item'

type ModelKey = string

/** 模块级缓存：同一模型进程内只加载一次 */
const cache = new Map<ModelKey, unknown>()

/** 物品数据缓存键 */
const itemKey = (game: GameVersion, type: ItemType) => `item:${game}:${type}`

/** 对话数据缓存键 */
const dialogueKey = (game: GameVersion, npc: string) => `dialogue:${game}:${npc}`

/**
 * 加载某游戏某类型的物品数据
 * 参考 eldenring-api 的 JSONLoader：模块级缓存，重复请求直接命中。
 */
export async function loadItems(game: GameVersion, type: ItemType): Promise<Item[]> {
  const key = itemKey(game, type)
  if (!cache.has(key)) {
    const module = await import(`@/data/ds${game}/${type}s.json`)
    cache.set(key, module.default as Item[])
  }
  return cache.get(key) as Item[]
}

/**
 * 加载某游戏某 NPC 的对话数据（模块级缓存）
 */
export async function loadDialogue(game: GameVersion, npc: string): Promise<Dialogue> {
  const key = dialogueKey(game, npc)
  if (!cache.has(key)) {
    const module = await import(`@/data/ds${game}/dialogues/${npc}.json`)
    cache.set(key, module.default as Dialogue)
  }
  return cache.get(key) as Dialogue
}

/**
 * 预加载全部游戏全部类型的物品数据（收藏页等场景）
 * 并发加载 + 缓存去重，单项失败降级为空数组，不影响整体。
 */
export async function loadAllItems(): Promise<Item[]> {
  const games: GameVersion[] = [1, 2, 3]
  const types: ItemType[] = ['weapon', 'armor', 'ring', 'item', 'magic']
  const results = await Promise.all(
    games.flatMap((game) => types.map((type) => loadItems(game, type).catch(() => [])))
  )
  return results.flat()
}

/**
 * 清空数据缓存
 * 开发期数据文件热更新、单测隔离时使用。
 */
export function clearDataCache(): void {
  cache.clear()
}

// 开发期热更新：数据文件变更时清空缓存，保证修改 JSON 立即生效
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    const updates = payload.updates ?? []
    if (updates.some((u) => u.acceptedPath.includes('/data/'))) {
      clearDataCache()
    }
  })
}
