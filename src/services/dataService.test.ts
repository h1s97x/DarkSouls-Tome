import { afterEach, describe, expect, it } from 'vitest'
import { clearDataCache, loadItems } from '@/services/dataLoader'
import { dataService } from '@/services/dataService'

describe('dataLoader', () => {
  afterEach(() => {
    clearDataCache()
  })

  it('加载物品数据且字段结构符合类型定义', async () => {
    const items = await loadItems(1, 'weapon')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0]).toMatchObject({
      id: expect.any(String),
      type: 'weapon',
      game: 1,
      name: expect.objectContaining({
        chn: expect.any(String),
        jap: expect.any(String),
        eng: expect.any(String)
      }),
      description: expect.objectContaining({ chn: expect.any(String) }),
      icon: expect.any(String)
    })
  })

  it('模块级缓存命中：重复加载返回同一数组引用', async () => {
    const first = await loadItems(1, 'weapon')
    const second = await loadItems(1, 'weapon')
    expect(first).toBe(second)
  })

  it('清空缓存后再次加载仍正常返回（幂等）', async () => {
    const first = await loadItems(1, 'weapon')
    clearDataCache()
    const second = await loadItems(1, 'weapon')
    // 模块级缓存保证同一路径只加载一次；清空后重新加载不应抛错且数据完整
    expect(second.length).toBe(first.length)
    expect(second[0]!.id).toBe('100000')
  })
})

describe('dataService', () => {
  afterEach(() => {
    clearDataCache()
  })

  it('getItemById 按 id 命中物品', async () => {
    const item = await dataService.getItemById(1, 'weapon', '100000')
    expect(item).toBeDefined()
    expect(item!.id).toBe('100000')
    expect(item!.name.chn).toBe('匕首')
  })

  it('getItemById 未命中返回 undefined', async () => {
    const item = await dataService.getItemById(1, 'weapon', 'not-exist')
    expect(item).toBeUndefined()
  })

  it('getFavoriteItems 按收藏 id 集合过滤（id 可能在多文件重复，返回全部匹配）', async () => {
    const favs = await dataService.getFavoriteItems(['100000', '999999'])
    expect(favs.length).toBeGreaterThan(0)
    expect(favs.every((i) => i.id === '100000')).toBe(true)
    expect(favs.some((i) => i.id === '999999')).toBe(false)
  })

  it('getItemCounts 由数据动态派生（ds2 防具实际 484 条）', async () => {
    const counts = await dataService.getItemCounts()
    expect(counts[2].armor).toBe(484)
    expect(counts[1].weapon).toBe(198)
  })

  it('getDialogue 返回对话数据', async () => {
    const dlg = await dataService.getDialogue(1, 'andre')
    expect(dlg.npc).toBe('andre')
    expect(dlg.game).toBe(1)
    expect(dlg.lines.length).toBeGreaterThan(0)
  })
})
