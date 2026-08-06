import type { Item } from '@/types/item'
import { normalizeForSearch } from '@/utils/formatter'

/**
 * 物品查询引擎（参考 eldenring-api 的 JSONDriver 链式查询）
 * 把「过滤 → 搜索 → 排序 → 分页」收口为统一的不可变管道，
 * 消除视图中各自实现的过滤逻辑，且每一步都返回新的 Query 实例，可安全复用。
 */

export type SearchLanguage = 'chn' | 'jap' | 'eng'
export type ItemSort = 'default' | 'name' | 'id'

/** 查询结果 */
export interface ItemQueryResult {
  items: Item[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 归一化文本：去格式标记 + 统一大小写，与搜索高亮/展示路径共用同一规则，避免两套规则漂移 */
const normalize = (text: string) => normalizeForSearch(text)

export const itemKey = (item: Pick<Item, 'game' | 'type' | 'id'>) =>
  `${item.game}:${item.type}:${item.id}`

/** 拼接物品所有语言的搜索文本 */
const allSearchText = (item: Item): string =>
  item.name.chn +
  item.name.jap +
  item.name.eng +
  item.description.chn +
  item.description.jap +
  item.description.eng +
  (item.remark ? item.remark.chn + item.remark.jap + item.remark.eng : '')

export class ItemQuery {
  private readonly source: Item[]
  private readonly predicate: (item: Item) => boolean
  private readonly sorter?: (a: Item, b: Item) => number

  private constructor(
    source: Item[],
    predicate: (item: Item) => boolean,
    sorter?: (a: Item, b: Item) => number
  ) {
    this.source = source
    this.predicate = predicate
    this.sorter = sorter
  }

  /** 从数据源创建查询 */
  static from(source: Item[]): ItemQuery {
    return new ItemQuery(source, () => true)
  }

  /**
   * 关键字搜索：匹配多语言名称/描述/备注（大小写不敏感）。
   * 任一语言命中即算匹配，避免“当前语言搜索不到但其他语言能搜到”的遗漏。
   */
  search(keyword: string): ItemQuery {
    const query = normalize(keyword.trim())
    if (!query) return this
    return new ItemQuery(
      this.source,
      (item) => this.predicate(item) && normalize(allSearchText(item)).includes(query),
      this.sorter
    )
  }

  /** 按指定语言搜索：只匹配该语言的名称/描述/备注 */
  searchIn(language: SearchLanguage, keyword: string): ItemQuery {
    const query = normalize(keyword.trim())
    if (!query) return this
    return new ItemQuery(
      this.source,
      (item) =>
        this.predicate(item) &&
        normalize(
          item.name[language] +
            item.description[language] +
            (item.remark ? item.remark[language] : '')
        ).includes(query),
      this.sorter
    )
  }

  /** 按复合键精确排除 */
  excludeKeys(keys: string[]): ItemQuery {
    if (keys.length === 0) return this
    const set = new Set(keys)
    return new ItemQuery(
      this.source,
      (item) => this.predicate(item) && !set.has(itemKey(item)),
      this.sorter
    )
  }

  /** 排序 */
  sortBy(sort: ItemSort): ItemQuery {
    if (sort === 'default') return this
    const sorter = (a: Item, b: Item): number => {
      if (sort === 'id') {
        const na = Number(a.id)
        const nb = Number(b.id)
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
        return a.id.localeCompare(b.id)
      }
      // name：按中文名称排序
      return a.name.chn.localeCompare(b.name.chn, 'zh-Hans-CN')
    }
    return new ItemQuery(this.source, this.predicate, sorter)
  }

  /** 分页并返回结果 */
  paginate(page = 1, pageSize = Infinity): ItemQueryResult {
    const filtered = this.source.filter(this.predicate)
    if (this.sorter) filtered.sort(this.sorter)
    const total = filtered.length
    const safePageSize = pageSize > 0 ? pageSize : Infinity
    const totalPages =
      safePageSize === Infinity ? (total > 0 ? 1 : 0) : Math.ceil(total / safePageSize)
    const safePage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages)
    const start = safePageSize === Infinity ? 0 : (safePage - 1) * safePageSize
    const items = safePageSize === Infinity ? filtered : filtered.slice(start, start + safePageSize)
    return { items, total, page: safePage, pageSize: safePageSize, totalPages }
  }
}
