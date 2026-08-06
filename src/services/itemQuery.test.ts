import { afterEach, describe, expect, it } from 'vitest'
import { clearDataCache } from '@/services/dataLoader'
import { dataService } from '@/services/dataService'
import { ItemQuery, itemKey } from '@/services/itemQuery'

afterEach(() => {
  clearDataCache()
})

const ds1Weapons = () => dataService.getItems(1, 'weapon')

describe('ItemQuery 查询引擎', () => {
  it('无关键字时返回全部数据', async () => {
    const items = await ds1Weapons()
    const result = ItemQuery.from(items).search('').paginate(1, Infinity)
    expect(result.total).toBe(items.length)
    expect(result.items.length).toBe(items.length)
  })

  it('search 跨语言命中（英文关键词可搜到中文名称物品）', async () => {
    const items = await ds1Weapons()
    // ds1 武器里有中文名"匕首"、英文名 "Dagger"
    const byEn = ItemQuery.from(items).search('dagger').paginate(1, Infinity).items
    const byCn = ItemQuery.from(items).search('匕首').paginate(1, Infinity).items
    expect(byEn.length).toBeGreaterThan(0)
    expect(byCn.length).toBeGreaterThan(0)
    // 同一条数据两种语言都能搜到
    const dagger = items.find((i) => i.name.chn === '匕首')!
    expect(byEn.map(itemKey)).toContain(itemKey(dagger))
    expect(byCn.map(itemKey)).toContain(itemKey(dagger))
  })

  it('search 大小写不敏感', async () => {
    const items = await ds1Weapons()
    const lower = ItemQuery.from(items).search('dagger').paginate(1, Infinity).items
    const upper = ItemQuery.from(items).search('DAGGER').paginate(1, Infinity).items
    expect(lower.length).toBe(upper.length)
    expect(lower.map(itemKey)).toEqual(upper.map(itemKey))
  })

  it('search 忽略格式标记（#0 等）不影响命中', async () => {
    // 对话索引无关，这里验证 description 含 # 标记时按纯文本匹配
    const items = await ds1Weapons()
    const result = ItemQuery.from(items).search('标准短剑').paginate(1, Infinity).items
    expect(result.length).toBeGreaterThan(0)
  })

  it('search 忽略 ## 前缀标记仍能命中（与 stripFormatting 归一化规则一致）', async () => {
    const items = await ds1Weapons()
    const result = ItemQuery.from(items).search('##魔法铁匠').paginate(1, Infinity)
    // 搜索词中的 ## 被归一化移除，等价于搜「魔法铁匠」
    const plain = ItemQuery.from(items).search('魔法铁匠').paginate(1, Infinity)
    expect(result.total).toBe(plain.total)
  })

  it('searchIn 只匹配指定语言', async () => {
    const items = await ds1Weapons()
    // "Dagger" 只出现在英文
    const en = ItemQuery.from(items).searchIn('eng', 'dagger').paginate(1, Infinity).items
    expect(en.length).toBeGreaterThan(0)
    const chn = ItemQuery.from(items).searchIn('chn', 'dagger').paginate(1, Infinity).items
    expect(chn.length).toBe(0)
  })

  it('excludeKeys 排除指定复合键', async () => {
    const items = await ds1Weapons()
    const target = items[0]!
    const result = ItemQuery.from(items)
      .excludeKeys([itemKey(target)])
      .paginate(1, Infinity).items
    expect(result.length).toBe(items.length - 1)
    expect(result.map(itemKey)).not.toContain(itemKey(target))
  })

  it('sortBy name 按中文名称排序', async () => {
    const items = await ds1Weapons()
    const sorted = ItemQuery.from(items).sortBy('name').paginate(1, Infinity).items
    const names = sorted.map((i) => i.name.chn)
    const expected = [...names].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    expect(names).toEqual(expected)
  })

  it('sortBy id 按数字 id 排序', async () => {
    const items = await ds1Weapons()
    const sorted = ItemQuery.from(items).sortBy('id').paginate(1, Infinity).items
    const ids = sorted.map((i) => Number(i.id))
    expect(ids).toEqual([...ids].sort((a, b) => a - b))
  })

  it('paginate 分页正确', async () => {
    const items = await ds1Weapons()
    const page1 = ItemQuery.from(items).paginate(1, 50)
    const page2 = ItemQuery.from(items).paginate(2, 50)
    expect(page1.items.length).toBe(50)
    expect(page2.items.length).toBe(50)
    expect(page1.totalPages).toBe(Math.ceil(items.length / 50))
    // 两页数据不重叠
    const keys1 = new Set(page1.items.map(itemKey))
    expect(page2.items.some((i) => keys1.has(itemKey(i)))).toBe(false)
  })

  it('paginate 越界页码被钳制到有效范围', async () => {
    const items = await ds1Weapons()
    const result = ItemQuery.from(items).paginate(999, 10)
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.page).toBeLessThanOrEqual(result.totalPages)
  })

  it('paginate 空结果时 totalPages 为 0、page 钳制为 1（可区分空结果与越界）', async () => {
    const items = await ds1Weapons()
    const result = ItemQuery.from(items).search('__不存在__').paginate(2, 10)
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.page).toBe(1)
    expect(result.items).toEqual([])
  })
})

describe('dataService 阶段3：查询能力增强', () => {
  it('searchItems 跨游戏全局搜索 + 分页', async () => {
    const result = await dataService.searchItems('匕首', { page: 1, pageSize: 5 })
    expect(result.total).toBeGreaterThan(0)
    expect(result.items.length).toBe(5)
    // 命中的物品一定在某个语言字段里包含关键词（名称/描述/备注均可）
    const contains = (item: (typeof result.items)[number]) => {
      const text =
        JSON.stringify(item.name) +
        JSON.stringify(item.description) +
        JSON.stringify(item.remark ?? '')
      return text.includes('匕首')
    }
    expect(result.items.every(contains)).toBe(true)
  })

  it('searchItems 支持按语言限定搜索', async () => {
    const en = await dataService.searchItems('dagger', { language: 'eng' })
    const chn = await dataService.searchItems('dagger', { language: 'chn' })
    expect(en.total).toBeGreaterThan(0)
    expect(chn.total).toBe(0)
  })

  it('getRelatedItems 返回同游戏同类型、排除自身', async () => {
    const items = await ds1Weapons()
    const target = items.find((i) => i.id === '100000')!
    const related = await dataService.getRelatedItems(target, 8)
    expect(related.length).toBeLessThanOrEqual(8)
    expect(related.every((i) => i.game === target.game && i.type === target.type)).toBe(true)
    expect(related.map(itemKey)).not.toContain(itemKey(target))
    // 同类型数据足够多时返回 8 条
    expect(related.length).toBe(8)
  })
})
