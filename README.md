# 黑暗之魂系列文本数据库 - 重构版

> 基于 Vue 3 + Vite + TypeScript 的现代化重构

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 项目简介

这是一个为《黑暗之魂》系列游戏（1、2、3代）打造的多语言文本数据库和查询系统，提供游戏内物品、装备、法术、NPC对话等内容的中日英三语对照查询功能。

本项目是对原有静态HTML项目的现代化重构，采用 Vue 3 + Vite 技术栈，提供更好的性能、用户体验和可维护性。

### 🙏 致谢原项目

本项目基于 [LeMinerva/Dark-Souls-Documents](https://github.com/LeMinerva/Dark-Souls-Documents) 进行重构开发。

原项目提供了完整的黑暗之魂系列游戏文本数据和图标资源，为本项目的开发奠定了坚实的基础。感谢原作者的辛勤工作和开源贡献！

**原项目在线地址**: <https://leminerva.github.io/Dark-Souls-Documents/>

### ✨ 核心特性

- 🎮 **完整数据**: 覆盖黑魂1/2/3三代游戏，超过3000条物品数据
- 🌍 **三语对照**: 中文、日文、英文同步显示
- 🔍 **快速搜索**: 支持物品名称和描述的模糊搜索
- ⭐ **收藏功能**: 本地保存常用查询
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🚀 **极速加载**: 基于Vite的极速开发和构建
- 💾 **离线支持**: PWA支持，可离线访问
- 🎨 **黑魂风格**: 保持原作的暗色主题设计

## 📊 数据统计

| 游戏 | 武器 | 防具 | 戒指 | 物品 | 法术 | NPC对话 |
|------|------|------|------|------|------|---------|
| 黑魂1 | 198 | 245 | 44 | 144 | 72 | 46个角色 |
| 黑魂2 | 374 | 481 | 77 | 205 | 125 | - |
| 黑魂3 | 321 | 394 | 80 | 241 | 108 | - |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/darksouls-tome.git
cd darksouls-tome

# 安装依赖
npm install

# 数据迁移（首次运行，需先放置原始 XML 到 reference/ 目录）
npm run convert-data
```

> ⚠️ `convert-data` 依赖 `reference/` 下的原始 XML 数据（已被 git 忽略，仅本地持有）。
> 目录缺失时脚本会直接报错中止，不会覆盖 `src/data/` 中的生产数据。

### 开发

```bash
# 启动开发服务器
npm run dev

# 在浏览器中打开 http://localhost:5173
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
DarkSouls-Tome/
├── reference/              # 原项目备份
├── docs/                   # 项目文档
│   ├── 项目调研报告.md
│   ├── 重构方案.md
│   ├── 技术选型对比.md
│   ├── 开发指南.md
│   └── 开发进度.md
├── src/                    # 源代码
│   ├── assets/            # 静态资源
│   ├── components/        # Vue组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── composables/       # 组合式函数
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript类型
│   └── data/              # 游戏数据（JSON）
├── public/                # 公共资源
│   └── icons/             # 游戏图标
└── scripts/               # 构建脚本（TypeScript，node --experimental-strip-types 直接运行）
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 8
- **开发语言**: TypeScript
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **样式方案**: SCSS + CSS Modules
- **PWA支持**: vite-plugin-pwa

## 📚 文档

- [项目调研报告](docs/项目调研报告.md) - 原项目分析和评估
- [重构方案](docs/重构方案.md) - 详细的重构设计方案
- [技术选型对比](docs/技术选型对比.md) - 技术栈选择依据
- [开发指南](docs/开发指南.md) - 开发环境配置和规范
- [开发进度](docs/开发进度.md) - 当前开发进度

## 🎯 开发路线图

### ✅ 阶段一：基础搭建（已完成）

- [x] 初始化Vue 3 + Vite项目
- [x] 配置TypeScript、路由、状态管理
- [x] 搭建基础项目结构
- [x] 创建首页和基础组件

### ✅ 阶段二：数据迁移（已完成）

- [x] 编写XML转JSON脚本
- [x] 转换所有游戏数据
- [x] 迁移图标资源
- [x] 验证数据完整性

### ✅ 阶段三：核心功能开发（已完成）

- [x] 实现物品列表和详情页
- [x] 实现对话查询功能
- [x] 实现三语切换
- [x] 实现搜索功能
- [x] 实现收藏功能

### ✅ 阶段四：UI/UX优化（已完成）

- [x] 实现响应式布局优化
- [x] 优化移动端体验
- [x] 添加加载动画和骨架屏
- [x] 添加页面过渡动画

### ✅ 阶段五：性能优化（已完成）

- [x] 实现代码分割
- [x] 添加图片懒加载
- [x] 优化构建配置
- [x] 配置PWA

### ✅ 阶段六：测试与部署（已完成）

- [x] 配置 GitHub Actions
- [x] 部署到 GitHub Pages
- [x] 文档完善
- [x] 项目收尾

**🎉 项目已完成！总进度：100%**

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [LeMinerva/Dark-Souls-Documents](https://github.com/LeMinerva/Dark-Souls-Documents) - 原项目及数据来源
- FromSoftware 及《黑暗之魂》系列
- Vue.js 和 Vite 团队
- 所有贡献者和支持者

## 📞 联系方式

- 项目主页: [GitHub](https://github.com/yourusername/darksouls-tome)
- 问题反馈: [Issues](https://github.com/yourusername/darksouls-tome/issues)
- 原项目: [Dark-Souls-Documents](https://github.com/LeMinerva/Dark-Souls-Documents)

---

⚔️ **Praise the Sun!** ☀️
