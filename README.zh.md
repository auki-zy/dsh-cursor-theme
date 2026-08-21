# dsh-cursor-theme

> 🖱️ 为 DeepSeek Harness 自定义鼠标各种状态的图案 —— 每个 UI 状态（默认、点击、文本、等待、禁止……）都可以换成你喜欢的 PNG/CUR 光标，实时生效、跨会话保存。

[English](README.md) · [需求文档](docs/requirements.md) · [可行性分析](docs/feasibility.md) · 已发布到 [npm](https://www.npmjs.com/package/dsh-cursor-theme) · 已收录于 [DSH 1024Store](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/catalog/plugins/auki-zy--dsh-cursor-theme.json)

---

## ✨ 功能

- 🎯 **按 UI 状态独立配置** —— 14 种鼠标状态（default、pointer、text、wait、help、not-allowed、grab、grabbing、progress、cell、copy、move、resize-ew、resize-ns），每个状态可单独设置图案、热区与尺寸
- 🎨 **18 套原创预设主题** —— 每套**完整覆盖全部 14 状态**（内置烘焙 PNG）：
  - 6 套配色：极光、蜜糖、薄荷、晚霞、石墨、高对比
  - 12 套创意主题：**猫爪 🐾 · 能量充能 ⚡ · 霓虹夜城 🌃 · 表情包 😀 · 像素 8-bit 👾 · 天气 ⛅ · 折纸 📐 · 太空人 🧑🚀 · 糖果玻璃 🍬 · 幽灵小镇 👻 · 高可见放大 🔍（48px）· 波普圆点 🎈**
  - 一键应用；每套主题还可一键下载为 ZIP 图片包
- 🖼️ **内置 SVG 模板库**（25 个原创形状）+ 上传自己的 PNG/CUR（≤128×128、≤512KB 校验）
- 📦 **图片包导入/导出** —— 一个 ZIP（每状态一张 PNG + `manifest.json`），可直接查看、修改、分享真实图片文件，或用 AI 生成后导入
- 🪟 **应用到系统（Windows）** —— 一键把主题写入系统光标方案（注册表 + `SPI_SETCURSORS`），Explorer 与所有应用立即生效；macOS 实验性 Swift 覆盖层 + 辅助功能权限引导
- 📍 **热区编辑**（X/Y）点击精确 · 🔍 尺寸档位 16/24/32/48
- 👁️ 每行右侧成品光标预览 + 左侧系统默认图标 —— 始终清楚自己正在替换什么
- ♿ **无障碍** —— 每项规则必带 fallback 关键字，图案失效自动回退系统光标，永不隐藏
- 💾 配置持久化到 profile（dsh-settings），重启保留
- 🌐 中英双语（locale 机制）

## 📦 安装

```sh
# DSH Desktop（GUI 运行的是 desktop profile）—— 也可从插件市场（1024Store）安装
dsh plugin --profile desktop add dsh-cursor-theme

# 纯 dsh web / 浏览器（可选）
dsh plugin --profile web add dsh-cursor-theme
```

重启 DSH Desktop（或刷新 `dsh web`），打开 **设置 → 光标主题**。

## 🎯 使用

| 操作 | 方法 |
|---|---|
| 套用预设主题 | 设置 → 光标主题 → 点击主题 |
| 下载主题 ZIP | 点击主题旁的下载图标 |
| 自定义单个状态 | 状态行点「编辑」→ 上传 PNG/CUR 或选内置形状 → 设置热区/尺寸 |
| 导入 ZIP 图片包 | 图片包 → 导入（例如 AI 生成的图片包） |
| 应用到整个系统（Windows） | 应用到系统 → 一键生效 |
| 全部还原 | 恢复系统默认 |

## 🛠️ 开发

```sh
npm install
npm run check    # typecheck + build + test
npm run build    # 构建宿主端 lib/ 与客户端 client/client.js
```

### 素材管线

- `scripts/theme-art.mjs` —— 12 套创意主题的原创手绘矢量素材（逐状态 SVG + 装饰器：发光 / 高光 / 圆点）
- `scripts/generate-theme-packs.mjs` —— 用 `@resvg/resvg-js` 把每套主题渲染成 32×32（或 48×48）PNG，产出 `data/theme-packs/<id>.zip`（图片包）+ `data/themes-<id>.json`
- `scripts/generate-assets.mjs` —— 把主题包合并进 `data/assets.json`（内置预设目录）
- 客户端经 esbuild 打包为单文件 `client/client.js`（external 仅 react 与 `@deepseek-ai/*`，由宿主 `__ModuleLoader__` 注入）

### 插件市场

- `docs/catalog/manifest.json` + `docs/catalog/v1/plugins.json` —— DSH Community Market 标准目录源（v1 合约），可部署到任何能正确返回 JSON content-type 的托管平台（如 Cloudflare Pages / Vercel）
- npm 发布：`npm publish`（需要带 *bypass 2FA* 的公共 npm 发布 token）

## 📁 目录结构

```
├── package.json            # dsh.bundle + dsh.client 声明
├── cordis.patch.yml        # 层插入补丁
├── docs/
│   ├── feasibility.md      # 可行性分析
│   ├── requirements.md     # 需求文档
│   └── catalog/            # 标准市场目录源
├── src/
│   ├── index.ts            # 宿主端入口（settings 命名空间注册）
│   ├── schema.ts           # 配置 schema（dsh-settings）
│   ├── system.ts           # Windows 注册表应用 / macOS Swift 覆盖层
│   ├── cur.ts              # PNG → .cur 编码
│   └── client/             # 客户端（esbuild 打包为单文件 client/client.js）
│       ├── index.ts        # 客户端入口（样式注入 + settings.section 注册）
│       ├── section.tsx     # 设置界面（状态/素材/主题/热区/尺寸/预览/还原）
│       ├── style.ts        # cursor CSS 生成器
│       ├── states.ts       # 状态 → CSS 选择器映射表
│       ├── assets.ts       # 内置素材目录
│       ├── themes.ts       # 内置主题目录
│       ├── pack.ts         # 主题包导出/导入与校验
│       ├── locales.ts      # 中英文案
│       └── types.ts        # 客户端结构类型
├── scripts/
│   ├── build-client.mjs    # esbuild 打包 + __ModuleLoader__ banner
│   ├── theme-art.mjs       # 原创创意主题素材
│   ├── generate-theme-packs.mjs # PNG 渲染 → 图片包 + 内置数据
│   └── generate-assets.mjs # 合并主题包到 data/assets.json
├── data/                   # 生成产物（主题图片包、内置目录）
└── tests/                  # 单元测试（34 个）
```

## 📄 License

MIT
