import { z } from 'zod'
import type { GameVersion, ItemType, Language } from '@/types/item'

/**
 * 数据校验 Schema（zod）
 * 以 src/data/ 下的 JSON 为唯一事实源，但数据异常需要可观测。
 * 这里定义与 types/item.ts 严格对应的运行时校验，供加载器与构建期脚本使用，
 * 数据字段漂移（缺字段 / 类型错误 / 非法枚举）会在第一时间被捕获。
 */

export const languageSchema = z.enum(['chn', 'jap', 'eng']).readonly() satisfies z.ZodType<Language>

export const gameVersionSchema = z
  .union([z.literal(1), z.literal(2), z.literal(3)])
  .readonly() satisfies z.ZodType<GameVersion>

export const itemTypeSchema = z
  .enum(['weapon', 'armor', 'ring', 'item', 'magic'])
  .readonly() satisfies z.ZodType<ItemType>

export const multiLangTextSchema = z.object({
  chn: z.string(),
  jap: z.string(),
  eng: z.string()
})

export const itemSchema = z.object({
  id: z.string().min(1),
  type: itemTypeSchema,
  game: gameVersionSchema,
  name: multiLangTextSchema,
  description: multiLangTextSchema,
  remark: multiLangTextSchema.optional(),
  icon: z.string().min(1)
})

export const itemArraySchema = z.array(itemSchema)

export const dialogueLineSchema = z.object({
  index: z.number(),
  chn: z.string(),
  jap: z.string(),
  eng: z.string(),
  isUnused: z.boolean().optional(),
  isTitle: z.boolean().optional()
})

export const dialogueSchema = z.object({
  npc: z.string().min(1),
  game: gameVersionSchema,
  avatar: z.string().min(1),
  lines: z.array(dialogueLineSchema)
})

export const dialogueIndexSchema = z.record(gameVersionSchema, z.array(z.string().min(1)))
