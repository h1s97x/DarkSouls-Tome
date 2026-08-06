import type { Dialogue, GameVersion, Item, ItemType } from '@/types/item'
import { dialogueIndexSchema, dialogueSchema, itemArraySchema } from '@/services/schemas'

type ModelKey = string

/** 模块级缓存：同一模型进程内只加载一次 */
const cache = new Map<ModelKey, unknown>()

/**
 * 数据异常类：字段漂移、类型错误等数据问题统一抛此错误，便于上层错误边界捕获与观测。
 */
export class DataValidationError extends Error {
  readonly details: unknown[]

  constructor(message: string, details: unknown[] = []) {
    super(message)
    this.name = 'DataValidationError'
    this.details = details
  }
}

/** 校验物品数据并返回强类型结果（数据异常抛出 DataValidationError） */
function validateItems(raw: unknown, path: string): Item[] {
  const result = itemArraySchema.safeParse(raw)
  if (!result.success) {
    throw new DataValidationError(
      `数据校验失败：${path}（${result.error.issues.length} 处异常，请运行 npm run validate:data）`,
      result.error.issues
    )
  }
  return result.data
}

/** 校验对话数据并返回强类型结果 */
function validateDialogue(raw: unknown, path: string): Dialogue {
  const result = dialogueSchema.safeParse(raw)
  if (!result.success) {
    throw new DataValidationError(
      `数据校验失败：${path}（${result.error.issues.length} 处异常，请运行 npm run validate:data）`,
      result.error.issues
    )
  }
  return result.data
}

/** 校验 NPC 索引并返回强类型结果 */
function validateNPCIndex(raw: unknown): Record<GameVersion, string[]> {
  const result = dialogueIndexSchema.safeParse(raw)
  if (!result.success) {
    throw new DataValidationError(
      `数据校验失败：dialogueIndex.json（${result.error.issues.length} 处异常，请重新运行 npm run generate:dialogue-index）`,
      result.error.issues
    )
  }
  return result.data
}

/** 物品数据缓存键 */
const itemKey = (game: GameVersion, type: ItemType) => `item:${game}:${type}`

/** 对话数据缓存键 */
const dialogueKey = (game: GameVersion, npc: string) => `dialogue:${game}:${npc}`

/** NPC 索引缓存键 */
const npcListKey = 'npc-list'

/**
 * 加载某游戏某类型的物品数据
 * 参考 eldenring-api 的 JSONLoader：模块级缓存，重复请求直接命中。
 */
export async function loadItems(game: GameVersion, type: ItemType): Promise<Item[]> {
  const key = itemKey(game, type)
  if (!cache.has(key)) {
    const module = await import(`@/data/ds${game}/${type}s.json`)
    cache.set(key, validateItems(module.default, `ds${game}/${type}s.json`))
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
    cache.set(key, validateDialogue(module.default, `ds${game}/dialogues/${npc}.json`))
  }
  return cache.get(key) as Dialogue
}

/**
 * 加载 NPC 索引（数据驱动：由 dialogueIndex.json 派生，替代手写硬编码数组）
 * 索引文件很小（~1KB），模块级缓存只加载一次。
 */
export async function loadNPCIndex(): Promise<Record<GameVersion, string[]>> {
  if (!cache.has(npcListKey)) {
    const module = await import('@/data/dialogueIndex.json')
    cache.set(npcListKey, validateNPCIndex(module.default))
  }
  return cache.get(npcListKey) as Record<GameVersion, string[]>
}

/**
 * 加载某游戏的全部 NPC 列表（由索引派生，顺序与数据目录一致）
 */
export async function getNPCList(game: GameVersion): Promise<string[]> {
  const index = await loadNPCIndex()
  return index[game] ?? []
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
