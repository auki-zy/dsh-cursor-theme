# dsh-cursor-theme

在 DeepSeek Harness（DSH）里自定义鼠标各种状态的图案 —— 每个 UI 状态（默认、点击、文本、等待、禁止……）都可以换成你喜欢的 PNG/CUR 光标，实时生效、跨会话保存。

> 状态：**M3 完成**（素材库 / 主题系统 / 导出导入 / 跟随亮暗）。需求文档见 [docs/requirements.md](docs/requirements.md)，可行性分析见 [docs/feasibility.md](docs/feasibility.md)。

## 功能

- 🎯 按 UI 状态独立配置光标图案（default / pointer / text / wait / not-allowed / grab / …）
- 🖼️ 内置素材库（21 个基础形状 × 3 色板）+ 上传 PNG/CUR（≤128×128、≤512KB 校验）
- 🎨 预设主题一键套用（Mono Dark / Mono Light / Neon / High Contrast）
- 📦 主题包导出/导入 JSON（素材以 base64 内嵌，可跨机器分享；导入有完整校验）
- 🌗 跟随 DSH 亮暗主题（浅色界面自动用深色光标，深色界面自动用浅色光标）
- 📍 热区（hotspot）X/Y 编辑，点击精确
- 🔍 尺寸档位 16/24/32/48
- 👁️ 实时预览（状态列表缩略图 + 已配置状态预览区）
- ♿ 无障碍：每项规则必带 fallback 关键字，图案失效自动回退系统光标
- 💾 配置持久化到 profile（dsh-settings），重启保留；一键还原系统默认
- 🌐 中英双语（locale 机制）

## 安装

```sh
# DSH Desktop（GUI 运行的是 desktop profile）
dsh plugin --profile desktop add dsh-cursor-theme

# 纯 dsh web / 浏览器（可选）
dsh plugin --profile web add dsh-cursor-theme
```

重启 DSH Desktop（或刷新 `dsh web`），打开 **设置 → 插件 → 光标主题**。

## 开发

```sh
npm install
npm run check    # typecheck + build + test
npm run build    # 构建宿主端 lib/ 与客户端 client/client.js
```

客户端经 esbuild 打包为单文件 bundle（external 仅 react 与 @deepseek-ai/*，由宿主 __ModuleLoader__ 注入）。内置素材由 `scripts/generate-assets.mjs` 生成（纯 Node 手写 PNG 编码，零图片依赖）。

## 目录结构

```
├── package.json          # dsh.bundle + dsh.client 声明
├── cordis.patch.yml      # 层插入补丁
├── docs/
│   ├── feasibility.md    # 可行性分析
│   └── requirements.md   # 需求文档
├── src/
│   ├── index.ts          # 宿主端入口（settings 命名空间注册）
│   ├── schema.ts         # 配置 schema（dsh-settings）
│   └── client/           # 客户端（esbuild 打包为单文件 client/client.js）
│       ├── index.ts      # 客户端入口（样式注入 + settings.section 注册）
│       ├── section.tsx   # 设置界面（状态/素材/主题/热区/尺寸/预览/还原）
│       ├── style.ts      # cursor CSS 生成器
│       ├── states.ts     # 状态 → CSS 选择器映射表
│       ├── assets.ts     # 内置素材目录
│       ├── themes.ts     # 内置主题目录
│       ├── pack.ts       # 主题包导出/导入与校验
│       ├── follow.ts     # 跟随亮暗主题的色板切换
│       ├── locales.ts    # 中英文案
│       └── types.ts      # 客户端结构类型
├── scripts/
│   ├── build-client.mjs  # esbuild 打包 + __ModuleLoader__ banner
│   └── generate-assets.mjs # 生成内置 PNG 素材与主题
└── tests/                # 单元测试（23 个）
```

## License

MIT
