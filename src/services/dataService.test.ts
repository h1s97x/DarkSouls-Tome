import { afterEach, describe, expect, it } from 'vitest'
import { clearDataCache, getNPCList, loadItems, loadNPCIndex } from '@/services/dataLoader'
import { dataService, itemKey } from '@/services/dataService'

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

describe('dataService 阶段2：数据驱动化', () => {
  afterEach(() => {
    clearDataCache()
  })

  it('getNPCList 由索引文件派生，与真实数据目录完全一致', async () => {
    const index = await loadNPCIndex()
    // 三个游戏都有 NPC 列表
    expect(index[1].length).toBeGreaterThan(0)
    expect(index[2].length).toBeGreaterThan(0)
    expect(index[3].length).toBeGreaterThan(0)
    // 与真实数据目录一致（由生成脚本保证，此处验证代表性 NPC 存在）
    const list1 = await getNPCList(1)
    expect(list1).toContain('alvina')
    expect(list1).toContain('andre')
    expect(list1).toContain('undeadman')
    expect(list1).not.toContain('rhea') // 硬编码时代的残留项已被移除
  })

  it('getNPCList 不存在游戏的游戏返回空数组', async () => {
    const list = await getNPCList(99 as 1)
    expect(list).toEqual([])
  })

  it('itemKey 复合键可精确定位（同一 id 跨文件重复）', async () => {
    // id=100 同时存在于 ds1-ring / ds1-item / ds3-item
    const items = await dataService.getAllItems()
    const dupItems = items.filter((i) => i.id === '100')
    expect(dupItems.length).toBeGreaterThan(1)
    const keys = dupItems.map(itemKey)
    // 复合键唯一
    expect(new Set(keys).size).toBe(keys.length)
    // 三者复合键各不相同
    expect(keys).toContain('1:ring:100')
    expect(keys).toContain('1:item:100')
    expect(keys).toContain('3:item:100')
  })

  it('getFavoriteItemsByKey 按复合键精确过滤收藏', async () => {
    const items = await dataService.getAllItems()
    const target = items.find((i) => i.id === '100' && i.game === 1 && i.type === 'ring')!
    const favs = await dataService.getFavoriteItemsByKey([itemKey(target)])
    expect(favs.length).toBe(1)
    expect(favs[0]).toMatchObject({ game: 1, type: 'ring', id: '100' })
  })

  it('ITEM_COUNTS 已删除，改用 getItemCounts 动态派生（数据事实源）', async () => {
    const counts = await dataService.getItemCounts()
    // ds2 防具实际 484 条（硬编码时代写 481，已漂移）
    expect(counts[2].armor).toBe(484)
    // 所有计数>0 且与全量数据吻合
    const items = await dataService.getAllItems()
    expect(counts[1].weapon).toBe(items.filter((i) => i.game === 1 && i.type === 'weapon').length)
  })
})
