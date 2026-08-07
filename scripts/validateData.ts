/**
 * 构建期数据校验脚本
 *
 * 以 src/data/ 下的 JSON 为唯一事实源，用 zod schema 校验全部物品 / 对话 / NPC 索引数据，
 * 任何字段漂移（缺字段、类型错误、非法枚举）都会在构建/CI 阶段直接报错退出，
 * 保证「数据异常可观测、可拦截」。用法：
 *   npm run validate:data
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dialogueIndexSchema, dialogueSchema, itemArraySchema } from '../src/services/schemas.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** 统计异常并打印，供排查 */
const issues: string[] = []

const games = [1, 2, 3] as const
const itemTypes = ['weapon', 'armor', 'ring', 'item', 'magic'] as const

/** 校验物品数据文件 */
function validateItemsFile(game: (typeof games)[number]) {
  for (const type of itemTypes) {
    const filePath = join(root, `src/data/ds${game}/${type}s.json`)
    try {
      const raw: unknown = JSON.parse(readFileSync(filePath, 'utf8'))
      const result = itemArraySchema.safeParse(raw)
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push(
            `[items] ds${game}/${type}s.json → ${issue.path.join('.') || '(root)'}: ${issue.message}`
          )
        }
      }
    } catch (e) {
      issues.push(
        `[items] ds${game}/${type}s.json 读取/解析失败: ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }
}

/** 校验对话数据文件 */
function validateDialoguesFile(game: (typeof games)[number]) {
  const dir = join(root, `src/data/ds${game}/dialogues`)
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const filePath = join(dir, file)
    try {
      const raw: unknown = JSON.parse(readFileSync(filePath, 'utf8'))
      const result = dialogueSchema.safeParse(raw)
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push(
            `[dialogue] ds${game}/dialogues/${file} → ${issue.path.join('.') || '(root)'}: ${issue.message}`
          )
        }
      }
    } catch (e) {
      issues.push(
        `[dialogue] ds${game}/dialogues/${file} 读取/解析失败: ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }
}

/** 校验 NPC 索引 */
function validateDialogueIndex() {
  const filePath = join(root, 'src/data/dialogueIndex.json')
  try {
    const raw: unknown = JSON.parse(readFileSync(filePath, 'utf8'))
    const result = dialogueIndexSchema.safeParse(raw)
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push(
          `[index] dialogueIndex.json → ${issue.path.join('.') || '(root)'}: ${issue.message}`
        )
      }
    }
  } catch (e) {
    issues.push(
      `[index] dialogueIndex.json 读取/解析失败: ${e instanceof Error ? e.message : String(e)}`
    )
  }
}

for (const game of games) {
  validateItemsFile(game)
  validateDialoguesFile(game)
}
validateDialogueIndex()

if (issues.length > 0) {
  console.error(`❌ 数据校验失败，共 ${issues.length} 处异常：`)
  for (const issue of issues.slice(0, 50)) {
    console.error(`  - ${issue}`)
  }
  if (issues.length > 50) {
    console.error(`  ... 还有 ${issues.length - 50} 处`)
  }
  process.exit(1)
}

console.log('✅ 数据校验通过：全部物品 / 对话 / NPC 索引与 schema 一致')
