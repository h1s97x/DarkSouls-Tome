import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Parser } from 'xml2js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const parser = new Parser()

// 游戏版本
const games = [1, 2, 3] as const
// 语言
const languages = ['chn', 'jap', 'eng'] as const
// 物品类型
const types = ['weapon', 'armor', 'ring', 'item', 'magic'] as const

type Game = (typeof games)[number]
type ItemType = (typeof types)[number]

interface XmlEntry {
  $?: { id?: string }
  _?: string
  text?: string
}

interface ParsedItem {
  id?: string
  text: string
}

interface DialogueLine {
  index: number
  id?: string
  text: string
}

interface MultiLangText {
  chn: string
  jap: string
  eng: string
}

interface ItemData {
  id?: string
  name: MultiLangText
  description: MultiLangText
  remark?: MultiLangText
  type?: ItemType
  game?: Game
  icon?: string
}

interface DialogueData {
  npc: string
  game: Game
  avatar: string
  lines: DialogueLineData[]
}

interface DialogueLineData {
  index: number
  chn: string
  jap: string
  eng: string
  isUnused: boolean
  isTitle: boolean
}

// reference/ 原始 XML 目录（已被 .gitignore 排除，仅本地持有）
const referenceDir = path.join(__dirname, '../reference')

/**
 * 安全检查：reference/ 目录不存在时直接中止，绝不覆盖 src/data/ 下的生产数据。
 * 若未来需要强制运行，可通过环境变量 REFERENCE_DIR 显式指定 XML 源目录。
 */
function ensureReferenceDir(): string {
  const explicit = process.env.REFERENCE_DIR
  const dir = explicit ? path.resolve(explicit) : referenceDir
  if (!fs.existsSync(dir)) {
    console.error(`❌ 原始 XML 目录不存在: ${dir}`)
    console.error('   请先放置游戏原始 XML 数据（reference/ 目录），再执行转换。')
    console.error('   参考: REFERENCE_DIR=<xml目录> npm run convert-data')
    process.exit(1)
  }
  return dir
}

async function parseXml(filePath: string): Promise<ParsedItem[]> {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf-8')
    const result = await parser.parseStringPromise(xmlData)
    return (result.entries.text as XmlEntry[]).map((item) => ({
      id: item.$?.id,
      text: item._ ?? item.text ?? ''
    }))
  } catch (error) {
    console.error(
      `Error parsing ${filePath}:`,
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}

async function parseDialogueXml(filePath: string): Promise<DialogueLine[]> {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf-8')
    const result = await parser.parseStringPromise(xmlData)
    return (result.entries.text as XmlEntry[]).map((item, index) => {
      const text = typeof item === 'string' ? item : (item._ ?? item.text ?? '')
      const id = item.$?.id
      return {
        index,
        id,
        text
      }
    })
  } catch (error) {
    console.error(
      `Error parsing ${filePath}:`,
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}

async function convertGameData(game: Game, referenceDir: string) {
  console.log(`\n转换 DS${game} 数据...`)

  for (const type of types) {
    const items: Record<string, ItemData> = {}

    // 读取名称
    for (const lang of languages) {
      const namePath = path.join(referenceDir, `text/${lang}${game}/${type}_name.xml`)
      if (fs.existsSync(namePath)) {
        const names = await parseXml(namePath)
        for (const item of names) {
          if (!items[item.id ?? '']) {
            items[item.id ?? ''] = {
              id: item.id,
              name: { chn: '', jap: '', eng: '' },
              description: { chn: '', jap: '', eng: '' }
            }
          }
          items[item.id ?? ''].name[lang] = item.text
        }
      }
    }

    // 读取描述
    for (const lang of languages) {
      const descPath = path.join(referenceDir, `text/${lang}${game}/${type}_desc.xml`)
      if (fs.existsSync(descPath)) {
        const descs = await parseXml(descPath)
        for (const item of descs) {
          if (!items[item.id ?? '']) {
            items[item.id ?? ''] = {
              id: item.id,
              name: { chn: '', jap: '', eng: '' },
              description: { chn: '', jap: '', eng: '' }
            }
          }
          items[item.id ?? ''].description[lang] = item.text
        }
      }
    }

    // 读取备注（如果有）
    const hasRemark: boolean = ['ring', 'item', 'magic'].includes(type)
    if (hasRemark) {
      for (const lang of languages) {
        const remarkPath = path.join(referenceDir, `text/${lang}${game}/${type}_remk.xml`)
        if (fs.existsSync(remarkPath)) {
          const remarks = await parseXml(remarkPath)
          for (const item of remarks) {
            const target = items[item.id ?? '']
            if (target) {
              if (!target.remark) {
                target.remark = { chn: '', jap: '', eng: '' }
              }
              target.remark[lang] = item.text
            }
          }
        }
      }
    }

    // 添加元数据
    const itemArray = Object.values(items)
      .filter((item) => item.name.chn || item.name.jap || item.name.eng) // 过滤空数据
      .map((item) => ({
        ...item,
        type,
        game,
        icon: `/icons/ds${game}/${type}s/${item.id}.webp`
      }))

    // 保存 JSON
    const outputDir = path.join(__dirname, `../src/data/ds${game}`)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, `${type}s.json`)
    fs.writeFileSync(outputPath, JSON.stringify(itemArray, null, 2), 'utf-8')

    console.log(`  ✓ ${type}s: ${itemArray.length} 项`)
  }
}

async function convertDialogues(game: Game, referenceDir: string) {
  console.log(`\n转换 DS${game} 对话...`)

  const dialogueDir = path.join(referenceDir, `text/chn${game}/dialogue`)
  if (!fs.existsSync(dialogueDir)) {
    console.log(`  ⚠ 对话目录不存在: ${dialogueDir}`)
    return
  }

  const npcFiles = fs.readdirSync(dialogueDir).filter((f) => f.endsWith('.xml'))

  const outputDir = path.join(__dirname, `../src/data/ds${game}/dialogues`)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  for (const npcFile of npcFiles) {
    const npcName = path.basename(npcFile, '.xml')
    const dialogue: DialogueData = {
      npc: npcName,
      game,
      avatar: `/icons/ds${game}/dialogues/${npcName}.webp`,
      lines: []
    }

    // 读取三种语言的对话
    for (const lang of languages) {
      const dialoguePath = path.join(referenceDir, `text/${lang}${game}/dialogue/${npcFile}`)
      if (fs.existsSync(dialoguePath)) {
        const lines = await parseDialogueXml(dialoguePath)
        for (const line of lines) {
          const index = line.index
          if (!dialogue.lines[index]) {
            dialogue.lines[index] = {
              index,
              chn: '',
              jap: '',
              eng: '',
              isUnused: false,
              isTitle: false
            }
          }
          dialogue.lines[index][lang] = line.text

          // 检查特殊标记
          if (line.text.includes('##')) {
            dialogue.lines[index].isUnused = true
          }
          if (line.text.includes('#0')) {
            dialogue.lines[index].isTitle = true
          }
        }
      }
    }

    // 保存 JSON
    const outputPath = path.join(outputDir, `${npcName}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(dialogue, null, 2), 'utf-8')
  }

  console.log(`  ✓ ${npcFiles.length} 个NPC对话已转换`)
}

async function main() {
  console.log('========================================')
  console.log('开始转换数据...')
  console.log('========================================')

  // P0 保护：reference 缺失立即中止，绝不覆盖生产数据
  const referenceDir = ensureReferenceDir()

  for (const game of games) {
    await convertGameData(game, referenceDir)
    await convertDialogues(game, referenceDir)
  }

  console.log('\n========================================')
  console.log('✓ 所有数据转换完成！')
  console.log('========================================\n')
}

main().catch((error) => {
  console.error('转换失败:', error)
  process.exit(1)
})
