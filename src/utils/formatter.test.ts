import { describe, expect, it } from 'vitest'
import {
  escapeRegExp,
  formatGameText,
  highlightText,
  normalizeForSearch,
  stripFormatting
} from '@/utils/formatter'

describe('formatter 搜索工具（阶段 3）', () => {
  it('stripFormatting 移除新旧格式标记', () => {
    expect(stripFormatting('#0第1次攀谈')).toBe('第1次攀谈')
    expect(stripFormatting('[cgb]已改变[/cgb]')).toBe('已改变')
    expect(stripFormatting('多行\r\n文本')).toBe('多行文本')
    expect(stripFormatting('[uud]未使用[/uud] #2金色#3')).toBe('未使用 金色')
    expect(stripFormatting('##魔法铁匠帽子')).toBe('魔法铁匠帽子')
  })

  it('normalizeForSearch 去标记 + 小写', () => {
    expect(normalizeForSearch('[cgd]Dagger[/cgd]')).toBe('dagger')
    expect(normalizeForSearch('#0Talk-1st time')).toBe('talk-1st time')
    expect(normalizeForSearch('##魔法铁匠帽子')).toBe('魔法铁匠帽子')
  })

  it('highlightText 高亮关键词（大小写不敏感）', () => {
    expect(highlightText('Dagger 匕首', 'dagger')).toBe('<mark>Dagger</mark> 匕首')
    expect(highlightText('Dagger', 'DAGGER')).toBe('<mark>Dagger</mark>')
  })

  it('highlightText 空关键词原样返回', () => {
    expect(highlightText('Dagger', '')).toBe('Dagger')
    expect(highlightText('Dagger', '   ')).toBe('Dagger')
  })

  it('highlightText 忽略关键词中的格式标记', () => {
    expect(highlightText('Dagger', '#0dagger')).toBe('<mark>Dagger</mark>')
    expect(highlightText('魔法铁匠帽子', '##魔法铁匠')).toBe('<mark>魔法铁匠</mark>帽子')
  })

  it('escapeRegExp 转义正则特殊字符', () => {
    expect(escapeRegExp('a.b')).toBe('a\\.b')
    expect(escapeRegExp('(x)')).toBe('\\(x\\)')
  })

  it('formatGameText 处理标记为 HTML（保持既有行为）', () => {
    const html = formatGameText('#0第1次攀谈')
    expect(html).toContain('<span class="dtt">')
  })
})
