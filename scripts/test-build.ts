/**
 * 构建测试脚本
 * 验证构建产物的完整性
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '../dist')

console.log('🔍 开始检查构建产物...\n')

// 检查 dist 目录是否存在
if (!fs.existsSync(distDir)) {
  console.error('❌ dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

// 必需的文件
const requiredFiles = ['index.html', 'assets']

// 检查必需文件
let hasError = false
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`)
  } else {
    console.error(`❌ ${file} 不存在`)
    hasError = true
  }
}

// 检查 assets 目录
const assetsDir = path.join(distDir, 'assets')
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir)
  console.log(`\n📦 assets 目录包含 ${files.length} 个文件`)

  const jsFiles = files.filter((f) => f.endsWith('.js'))
  const cssFiles = files.filter((f) => f.endsWith('.css'))

  console.log(`   - JS 文件: ${jsFiles.length}`)
  console.log(`   - CSS 文件: ${cssFiles.length}`)
}

// 检查 icons 目录
const iconsDir = path.join(distDir, 'icons')
if (fs.existsSync(iconsDir)) {
  const countIcons = (dir: string): number => {
    let count = 0
    for (const item of fs.readdirSync(dir)) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      if (stat.isDirectory()) {
        count += countIcons(itemPath)
      } else if (item.endsWith('.webp')) {
        count++
      }
    }
    return count
  }

  const iconCount = countIcons(iconsDir)
  console.log(`\n🖼️  图标文件: ${iconCount} 个`)
}

// 检查 index.html
const indexPath = path.join(distDir, 'index.html')
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf-8')

  // 检查是否包含必要的标签
  const checks = [
    { name: 'script 标签', pattern: /<script[^>]*type="module"/ },
    { name: 'link 标签', pattern: /<link[^>]*rel="stylesheet"/ },
    { name: 'meta viewport', pattern: /<meta[^>]*name="viewport"/ }
  ]

  console.log('\n📄 index.html 检查:')
  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.name}`)
    } else {
      console.log(`   ⚠️  ${check.name} 未找到`)
    }
  }
}

// 计算总大小
const getDirectorySize = (dir: string): number => {
  let size = 0
  for (const item of fs.readdirSync(dir)) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      size += getDirectorySize(itemPath)
    } else {
      size += stat.size
    }
  }
  return size
}

const totalSize = getDirectorySize(distDir)
const sizeMB = (totalSize / 1024 / 1024).toFixed(2)
console.log(`\n📊 构建产物总大小: ${sizeMB} MB`)

if (hasError) {
  console.error('\n❌ 构建检查失败')
  process.exit(1)
} else {
  console.log('\n✅ 构建检查通过')
  process.exit(0)
}
