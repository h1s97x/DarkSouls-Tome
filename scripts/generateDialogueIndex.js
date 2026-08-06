/**
 * 生成对话 NPC 索引文件 src/data/dialogueIndex.json
 *
 * 数据驱动：NPC 列表不再手写硬编码数组，而是由实际数据文件扫描生成，
 * 保证页面展示与数据目录 100% 一致（杜绝 DRY 漂移 / 列表与文件对不上）。
 *
 * 用法：npm run generate:dialogue-index
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const games = [1, 2, 3]

function buildIndex() {
  const index = {}
  for (const game of games) {
    const dialogueDir = path.join(__dirname, `../src/data/ds${game}/dialogues`)
    if (!fs.existsSync(dialogueDir)) {
      console.warn(`  ⚠ 对话目录不存在: ${dialogueDir}`)
      index[game] = []
      continue
    }
    const npcList = fs
      .readdirSync(dialogueDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.basename(f, '.json'))
      // 固定排序规则（不依赖运行环境 locale），保证跨平台可复现
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    index[game] = npcList
  }
  return index
}

function main() {
  const index = buildIndex()
  const outputPath = path.join(__dirname, '../src/data/dialogueIndex.json')
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2) + '\n', 'utf-8')

  for (const game of games) {
    console.log(`  ✓ ds${game}: ${index[game].length} 个 NPC`)
  }
  console.log(`已写入 ${outputPath}`)
}

main()
