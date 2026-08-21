# dsh-cursor-theme 宣传文案包

> 插件：dsh-cursor-theme v0.1.0 · 为 DeepSeek Harness (DSH) 自定义鼠标光标主题
> 链接：GitHub https://github.com/auki-zy/dsh-cursor-theme · npm https://www.npmjs.com/package/dsh-cursor-theme
> 1024Store 收录：https://github.com/imsai-sh/awesome-deepseek-harness-plugins

---

## 一、一句话定位（所有平台通用）

**「给 DSH 换个鼠标光标，18 套主题一键套用，还能应用到整个 Windows 系统。」**

备选（按平台语气换）：
- 极客版：为 DeepSeek Harness 量身打造的光标主题插件——14 种鼠标状态全覆盖，18 套原创主题，一键应用到系统级。
- 日常版：写代码 / 用 DSH 的时候，光标也能可可爱爱——猫爪、像素、霓虹任你挑。

## 二、核心卖点（3 个，别一次全堆）

1. **18 套原创主题**（6 套配色 + 12 套创意：猫爪 🐾 能量 ⚡ 霓虹 🌃 表情包 😀 像素 👾 天气 ⛅ 折纸 📐 太空人 🧑🚀 糖果 🍬 幽灵 👻 高可见 🔍 波普 🎈），每套覆盖全部 14 种鼠标状态。
2. **一键应用到系统**（Windows）：不只是 DSH 界面内生效，能写入系统光标方案（注册表 + SPI_SETCURSORS），整个系统所有应用的光标一起变。
3. **AI 生成 + 图片包导入导出**：内置 AI 提示词，让 AI 帮你画整套光标；ZIP 图片包可分享、可导入。

加分项（按篇幅取舍）：
- 免费、MIT 开源
- 支持 PNG/CUR 上传、热区（点击点）编辑、尺寸 16-48
- 中英双语界面
- 已发布 npm、已收录 1024Store 插件市场

## 三、各平台文案

---

### 1. V2EX（技术社区 · 中文 · 中长帖）

标题：为 DeepSeek Harness 做了个鼠标光标主题插件，18 套主题 + 可应用到系统级

正文：
最近给 DSH（DeepSeek Harness）写了个光标主题插件 dsh-cursor-theme，分享给大家。

功能：
- 14 种鼠标状态（默认/点击/文本/等待/禁止/抓取/缩放等）全覆盖，每种都能单独换图、调热区和尺寸
- 内置 18 套原创主题：6 套配色（极光/蜜糖/薄荷/晚霞/石墨/高对比）+ 12 套创意（猫爪、霓虹、像素、表情包、太空人、折纸、幽灵、糖果……）
- 图片包机制：一套主题 = 一个 ZIP（每状态一张 PNG + manifest），可导出分享，也内置了 AI 提示词——让 AI 帮你生成整套光标
- Windows 下可一键应用到系统级光标（注册表 + SPI_SETCURSORS），Explorer 和所有应用立即生效；macOS 是实验性的 Swift 覆盖层
- 支持上传自己的 PNG/CUR，热区编辑，尺寸 16/24/32/48

免费、MIT、npm 已发布，也收录进 1024Store 市场了。想定制自己风格的光标又懒得动手的话，AI 提示词那段可以直接抄。

GitHub：https://github.com/auki-zy/dsh-cursor-theme
npm：https://www.npmjs.com/package/dsh-cursor-theme

安装：`dsh plugin --profile desktop add dsh-cursor-theme`

有什么问题欢迎提 issue，也欢迎提主题点子。

---

### 2. 掘金 / 知乎 / CSDN（技术博客 · 长文 · 标题党适度）

标题选项：
- 「给 AI 编程助手换光标？我做了个 18 套主题的 DSH 插件」
- 「DSH 插件开发实战：从零做一个支持系统级应用的光标主题插件」

正文骨架（博主向，讲干货 + 引流）：

# 我写了一个 DSH 光标主题插件：dsh-cursor-theme

## 为什么做这个
用 DSH（DeepSeek Harness）久了，界面可以换主题，但光标一直是系统默认。写代码时鼠标在编辑器、终端、浏览器之间来回切，光标如果能跟界面风格统一，体验会完整很多。

## 插件能做什么
1. **14 种鼠标状态全覆盖**：默认、点击、文本输入、等待、禁止、抓取、缩放……DSH 里每一种状态都能单独指定光标图案，还能调热区（点击点）和尺寸。
2. **18 套原创主题**：6 套配色 + 12 套创意（猫爪、霓虹、像素、表情包、太空人、折纸、幽灵、糖果、波普……），每套都是 14 状态齐全的成品。
3. **系统级应用（Windows）**：一键把主题写入系统光标方案（注册表 `HKCU\Control Panel\Cursors` + `SPI_SETCURSORS`），不只是 DSH 界面，整个系统都生效。macOS 做了实验性的 Swift 覆盖层。
4. **图片包 + AI 生成**：主题以 ZIP 图片包形式组织（每状态一张 PNG + manifest.json），支持导入导出；内置一段 AI 提示词，复制给任意图像 AI，就能生成一套专属光标。

## 技术要点（写给开发者）
- DSH 插件规范：host 端 `inject: ['settings','webServer']`，客户端 `settings.section` 注册设置页
- 客户端用 esbuild 打成单文件，外部依赖（react、@deepseek-ai/*）由宿主 `__ModuleLoader__` 注入
- SVG 模板 + 占位符配色 → resvg 渲染成 PNG，生成阶段完成全部烘焙
- 主题包 = ZIP + manifest.json（schema 1），校验严格、失败即拒
- Windows 系统光标应用：`reg add` 写注册表 + 临时 PowerShell 调 `SPI_SETCURSORS` 刷新

## 地址
GitHub / npm / 1024Store（见顶部）

---

### 3. 即刻 / 微博 / 朋友圈（短平快 · 配图）

版本 A（配 18 主题拼图）：
DSH 光标主题插件来了 🖱️ 18 套原创主题：猫爪、霓虹、像素、表情包、太空人……一键套用，Windows 还能应用到整个系统。免费开源，AI 提示词内置，让 AI 帮你画整套光标。
GitHub: github.com/auki-zy/dsh-cursor-theme

版本 B（配猫爪/像素特写）：
写代码也要可爱 ✨ 给 DSH 换套猫爪光标，14 种鼠标状态全都有，还能整个 Windows 一起换。开源免费，喜欢哪个主题评论区说，考虑加新款式 🐾

版本 C（配"应用到系统"截图）：
刚才把 DSH 的光标主题一键应用到了整个 Windows——系统里所有应用的光标都变成霓虹色了 🌃 插件开源：github.com/auki-zy/dsh-cursor-theme

---

### 4. B 站 / 抖音 / 小红书（视频脚本 · 30-60 秒）

标题：DSH 光标居然能变成猫爪？这个开源插件太解压了 🐾

脚本：
- 0-5s 钩子：展示 DSH 默认光标 → 一键切换成猫爪光标特写（放大）
- 5-15s 介绍：这是一个 DSH 插件，14 种鼠标状态全覆盖，18 套原创主题——猫爪、霓虹、像素、表情包、太空人都有
- 15-30s 操作：打开设置 → 光标主题 → 点主题 → 光标立刻变；再演示应用到整个系统（Windows）
- 30-45s 进阶：演示用 AI 提示词生成自定义光标 → 导入 ZIP 图片包
- 45-60s 收尾：免费开源，链接在简介；"你最想要什么主题？评论区告诉我"

小红书图文版（标题 + 分图）：
标题：把 DSH 的光标换成猫爪后，我写代码效率都高了（不是）
图1：18 套主题拼图
图2：设置界面操作截图
图3：猫爪光标在系统里的特写
文案：免费开源插件 dsh-cursor-theme 🖱️ 14 种鼠标状态全覆盖，能应用到整个 Windows，还有 AI 生成功能，详情见置顶评论～

---

### 5. X / Twitter（英文 · 短）

Emoji-focused（配 GIF）：
Made a cursor theme plugin for DeepSeek Harness 🖱️
- 18 original themes (paw, neon, pixel, emoji, astronaut…)
- all 14 mouse states covered
- one-click apply to the whole Windows system
- AI prompt included to generate your own set
Free & MIT. Try it: github.com/auki-zy/dsh-cursor-theme

Dev-focused（技术圈）：
Open-sourced dsh-cursor-theme — per-state cursor customization for DeepSeek Harness.
- 14 UI states, hotspot & size per state
- 18 baked themes via SVG templates + resvg
- system-level apply on Windows (registry + SPI_SETCURSORS)
- ZIP image packs with a copy-paste AI prompt
npm: npmjs.com/package/dsh-cursor-theme

---

### 6. Reddit（英文 · 分社区）

r/DeepSeek（用户向）：
Title: I made a cursor theme plugin for DeepSeek Harness — 18 themes, applies to the whole Windows system

Body:
Made an open-source plugin that lets you change the mouse cursor for every UI state inside DSH (default, pointer, text, wait, not-allowed, resize…).

Highlights:
- 18 original themes: color palettes + creative ones (paw, neon, pixel, emoji, astronaut, origami, ghost, candy…)
- ZIP image packs: export/share/import; includes an AI prompt so you can generate your own set
- Windows: one-click apply to the whole system (registry + SPI_SETCURSORS)
- Free, MIT

Repo: github.com/auki-zy/dsh-cursor-theme
Install: `dsh plugin --profile desktop add dsh-cursor-theme`

Happy to take theme requests / issues!

r/commandline 或 r/selfhosted（工具向）：
Title: [Tool] dsh-cursor-theme — per-state cursor themes for DeepSeek Harness, with system-level apply on Windows
（正文同上，强调可定制 + 开源）

---

### 7. Product Hunt / 独立开发平台（英文 · 列表页文案）

Name: dsh-cursor-theme
Tagline: Per-state cursor themes for DeepSeek Harness, with one-click system-level apply
Description:
dsh-cursor-theme lets you give every mouse state inside DeepSeek Harness its own cursor. 18 original themes (paw, neon, pixel, emoji, astronaut and more) cover all 14 UI states out of the box. Themes ship as ZIP image packs you can export, share, import — or generate with an included AI prompt. On Windows, apply any theme to the whole OS cursor scheme in one click (registry + SPI_SETCURSORS); macOS gets an experimental overlay.

---

### 8. DSH / DeepSeek 官方社区、微信群、QQ 群（口语化）

标题/首句：给 DSH 做了个光标主题插件，分享给大家

正文：
最近给 DeepSeek Harness 写了个小插件，可以自定义鼠标光标：
- 14 种鼠标状态全覆盖（点击、文本、等待、禁止、抓取、缩放这些都能单独换）
- 内置 18 套主题：极光、蜜糖、猫爪、霓虹、像素、表情包、太空人、幽灵、糖果……
- Windows 下能一键应用到整个系统，所有应用的光标一起变
- 支持导入导出 ZIP 图片包，还内置了 AI 提示词，可以让 AI 帮你画
- 免费开源

安装：`dsh plugin --profile desktop add dsh-cursor-theme`
GitHub：github.com/auki-zy/dsh-cursor-theme

---

## 四、配图建议

1. **主图（必做）**：18 套主题的 default 状态拼图（可以跑 `data/theme-packs/` 里的预览图，或让我生成一张宣传拼图）
2. **动图（效果最好）**：录一段 5-10 秒的屏幕录制——打开设置 → 点几个主题 → 光标即时切换
3. **系统级应用对比图**：应用前（系统默认光标）vs 应用后（霓虹/猫爪光标）截图对比
4. **AI 生成流程**：AI 提示词 → 生成的 PNG 图 → 导入 ZIP → 光标生效

> 需要的话我可以帮你生成第 1 张主题拼图宣传图。

## 五、发布节奏建议

- **Day 1**：GitHub Release + npm（已完成）+ V2EX + 即刻/微博
- **Day 2**：掘金/知乎长文 + 小红书
- **Day 3-7**：B 站视频（若有精力）+ Reddit/X 英文帖
- **持续**：根据社区反馈收集主题需求，迭代新主题（正好展示插件活跃度）

## 六、注意事项

- 各平台链接都指向 GitHub 即可（README 已包含完整信息）
- macOS 系统级应用是实验性功能，宣传时建议写"Windows 完整支持，macOS 实验性"
- 别把 AI 提示词说成"自动生成"，是"提供提示词 + 图片包导入"，避免误导
- 1024Store 生产目录同步还在等上游恢复，宣传时可提"已收录 1024Store"，但不必提同步细节
