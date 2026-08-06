/**
 * 格式化游戏文本，处理特殊标记（原版风格）
 */
export function formatGameText(text: string): string {
  if (!text) return ''

  let formatted = text

  // 未使用文本 - 红色删除线
  formatted = formatted.replace(/\[uud\](.*?)\[\/uud\]/g, '<span class="uud">$1</span>')

  // 已改变文本 - 黄色删除线
  formatted = formatted.replace(/\[cgb\](.*?)\[\/cgb\]/g, '<span class="cgb">$1</span>')

  // 金色文本
  formatted = formatted.replace(/\[cgd\](.*?)\[\/cgd\]/g, '<span class="cgd">$1</span>')

  // 标题文本
  formatted = formatted.replace(/\[dtt\](.*?)\[\/dtt\]/g, '<span class="dtt">$1</span>')

  // 兼容旧格式
  formatted = formatted.replace(/#1/g, '<span class="cgb">')
  formatted = formatted.replace(/#2/g, '<span class="cgd">')
  formatted = formatted.replace(/#3/g, '</span>')
  formatted = formatted.replace(/##/g, '<i class="text-red text-sm">未使用</i>')
  formatted = formatted.replace(/#0/g, '<span class="dtt">')

  // 换行
  formatted = formatted.replace(/\n/g, '<br>')

  return formatted
}

// 别名，保持向后兼容
export const formatText = formatGameText

/**
 * 移除格式化标记，获取纯文本
 * 兼容：[uud][/uud]、[cgb][/cgb]、[cgd][/cgd]、[dtt][/dtt]、#0/#1/#2/#3/## 及换行符。
 */
export function stripFormatting(text: string): string {
  return text
    .replace(/\[\/?(uud|cgb|cgd|dtt)\]/g, '')
    .replace(/#\d|##/g, '')
    .replace(/\r?\n/g, '')
}

/**
 * 归一化搜索文本：去格式标记 + 统一大小写
 * 搜索词与数据文本都经过此函数，保证「格式标记不影响命中」。
 */
export function normalizeForSearch(text: string): string {
  return stripFormatting(text).toLowerCase()
}

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 高亮搜索关键词（返回带 <mark> 标签的 HTML 片段）
 */
export function highlightText(text: string, keyword: string): string {
  const query = stripFormatting(keyword).trim()
  if (!query) return text
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
