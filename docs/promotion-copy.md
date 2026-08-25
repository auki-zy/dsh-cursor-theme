# dsh-cursor-theme · 复制即贴宣传清单

> 使用方法：每个平台一段，复制后粘贴即可。配图路径均为项目内文件，发布时上传对应图片。
> 常用链接：
> - GitHub: https://github.com/auki-zy/dsh-cursor-theme
> - npm: https://www.npmjs.com/package/dsh-cursor-theme
> - Release: https://github.com/auki-zy/dsh-cursor-theme/releases/tag/v0.3.0
> - 安装: `dsh plugin --profile desktop add dsh-cursor-theme`
> - 宣传拼图: `data/theme-packs/promo-banner.png`（1600×1040）
>
> 🖼️ **宣传图说明（最新版）**：每套主题展示**全部 14 种鼠标状态**的图标拼图（4×4 网格）；**personal 主题（如 cat-sitiao）排在最后**，带蓝色 **Personal** 徽章和虚线边框——传达"可以自定义自己的主题并存在自己仓库"。发布时把这张图作为主图，视觉冲击力远大于单张 default 图——让人一眼看到"一套主题 = 14 个状态全覆盖"。

---

## 1️⃣ V2EX（技术社区）

**标题：**
为 DeepSeek Harness 做了个鼠标光标主题插件，19 套主题 + 可应用到系统级

**正文：**
最近给 DSH（DeepSeek Harness）写了个光标主题插件 dsh-cursor-theme，分享给大家。

功能：
- 14 种鼠标状态（默认/点击/文本/等待/禁止/抓取/缩放等）全覆盖，每种都能单独换图、调热区和尺寸
- 内置 18 套原创主题（6 套配色 + 12 套创意：猫爪、霓虹、像素、表情包、太空人、折纸、幽灵、糖果……），**还支持 Personal 个人主题**——Fork 仓库放入自己的图片包，就能变成内置主题
- 图片包机制：一套主题 = 一个 ZIP（每状态一张 PNG + manifest），可导出分享，也内置了 AI 提示词——让 AI 帮你生成整套光标
- Windows 下可一键应用到系统级光标（注册表 + SPI_SETCURSORS），Explorer 和所有应用立即生效；macOS 是实验性的 Swift 覆盖层
- 支持上传自己的 PNG/CUR，热区编辑，尺寸 16/24/32/48

免费、MIT、npm 已发布，也收录进 1024Store 市场了。想定制自己风格的光标又懒得动手的话，AI 提示词那段可以直接抄。

GitHub：https://github.com/auki-zy/dsh-cursor-theme
npm：https://www.npmjs.com/package/dsh-cursor-theme

安装：`dsh plugin --profile desktop add dsh-cursor-theme`

有什么问题欢迎提 issue，也欢迎提主题点子。

**配图：** `data/theme-packs/promo-banner.png`

---

## 2️⃣ 掘金 / 知乎 / CSDN（技术博客长文）

**标题（三选一）：**
- 给 AI 编程助手换光标？我做了个 18+1 套主题的 DSH 插件
- DSH 插件开发实战：从零做一个支持系统级应用的光标主题插件
- 开源一个 DSH 光标主题插件：14 种状态全覆盖 + 19 套主题

**正文：**

# 我写了一个 DSH 光标主题插件：dsh-cursor-theme

## 为什么做这个
用 DSH（DeepSeek Harness）久了，界面可以换主题，但光标一直是系统默认。写代码时鼠标在编辑器、终端、浏览器之间来回切，光标如果能跟界面风格统一，体验会完整很多。

## 插件能做什么
1. **14 种鼠标状态全覆盖**：默认、点击、文本输入、等待、禁止、抓取、缩放……DSH 里每一种状态都能单独指定光标图案，还能调热区（点击点）和尺寸。
2. **19 套主题**：18 套原创（6 配色 + 12 创意：猫爪、霓虹、像素、表情包、太空人、折纸、幽灵、糖果、波普……）+ **Personal 个人主题**——Fork 仓库放入自己的图片包即成为内置主题。
3. **系统级应用（Windows）**：一键把主题写入系统光标方案（注册表 `HKCU\Control Panel\Cursors` + `SPI_SETCURSORS`），不只是 DSH 界面，整个系统都生效。macOS 做了实验性的 Swift 覆盖层。
4. **图片包 + AI 生成**：主题以 ZIP 图片包形式组织（每状态一张 PNG + manifest.json），支持导入导出；内置一段 AI 提示词，复制给任意图像 AI，就能生成一套专属光标。

## 技术要点（写给开发者）
- DSH 插件规范：host 端 `inject: ['settings','webServer']`，客户端 `settings.section` 注册设置页
- 客户端用 esbuild 打成单文件，外部依赖（react、@deepseek-ai/*）由宿主 `__ModuleLoader__` 注入
- SVG 模板 + 占位符配色 → resvg 渲染成 PNG，生成阶段完成全部烘焙
- 主题包 = ZIP + manifest.json（schema 1），校验严格、失败即拒
- Windows 系统光标应用：`reg add` 写注册表 + 临时 PowerShell 调 `SPI_SETCURSORS` 刷新

## 地址
GitHub：https://github.com/auki-zy/dsh-cursor-theme
npm：https://www.npmjs.com/package/dsh-cursor-theme
安装：`dsh plugin --profile desktop add dsh-cursor-theme`

**配图：** 封面用 `data/theme-packs/promo-banner.png`，正文可穿插主题细节截图

### CSDN 专属版（SEO 长尾向，重点"教程"而非"宣传"）

> 适用于：CSDN。搜索引擎（尤其百度）对 CSDN 收录友好，标题带足关键词吃长尾流量。正文里 GitHub 链接出现 1-2 次即可，不要堆砌外链。

**CSDN 标题（三选一）：**
- DeepSeek Harness 自定义鼠标光标教程：18 套主题一键换、还能应用到整个系统
- DSH 插件开发实战：手把手教你给 DeepSeek Harness 换鼠标光标主题
- AI 编程工具也能换皮肤：DeepSeek Harness 光标主题插件使用教程

**CSDN 正文：**

# DeepSeek Harness 自定义鼠标光标教程：18 套主题一键换、还能应用到整个系统

用 AI 编程工具（DeepSeek Harness，简称 DSH）久了，界面能换主题，但**鼠标光标一直是系统默认**。写代码时鼠标在编辑器、终端、浏览器之间来回切，光标如果能跟界面风格统一，体验会完整很多。

今天分享一个免费开源的 DSH 插件 **dsh-cursor-theme**，它可以给 DSH 的**每一种鼠标状态**（默认、点击、文本输入、等待、禁止、抓取、缩放……）单独指定光标图案，还内置了 18 套原创主题，甚至能一键应用到**整个 Windows 系统**。

## 一、这个插件能做什么

- **14 种鼠标状态全覆盖**：default（默认）、pointer（点击）、text（文本输入）、wait（等待）、help（帮助）、not-allowed（禁止）、grab（抓取）、grabbing（抓取中）、progress（进行中）、cell（单元格）、copy（复制）、move（移动）、resize-ew（水平缩放）、resize-ns（垂直缩放）——每个状态都能单独换图、调热区和尺寸
- **18 套原创主题**：6 套配色（极光、蜜糖、薄荷、晚霞、石墨、高对比）+ 12 套创意主题（猫爪、霓虹、像素、表情包、太空人、折纸、幽灵、糖果、波普……），每套都是 14 状态齐全的成品
- **个人主题（Personal）**：支持导入自己的 ZIP 图片包，也可以 Fork 仓库维护专属主题
- **一键应用到系统（Windows）**：把主题写入系统光标方案（注册表 + SPI_SETCURSORS），不只是 DSH 界面，整个系统所有应用的光标一起变
- **AI 生成**：内置 AI 提示词，复制给任意图像 AI，就能生成一套专属光标
- **图片包机制**：一套主题 = 一个 ZIP（每状态一张 PNG + manifest.json），可导出分享、可导入

## 二、安装

安装非常简单，打开命令行执行：

```bash
# DSH Desktop（GUI 运行的是 desktop profile）
dsh plugin --profile desktop add dsh-cursor-theme
```

或者从 DSH 的插件市场（1024Store）里搜索安装。

装完重启 DSH Desktop，打开 **设置 → 光标主题** 就能看到配置界面。

## 三、使用教程

### 1. 一键套用主题
设置 → 光标主题 → 预设主题区，点击任意一个主题即可应用。每个主题都是 14 状态齐全的成品，点一下全部生效。

### 2. 自定义单个状态
点状态行右侧的「编辑」：上传自己的 PNG/CUR 图片（≤128×128，≤512KB），或从内置 SVG 模板库选一个形状，再设置热区（点击点）和尺寸（16/24/32/48）。

### 3. 用 AI 生成整套光标
在「图片包」区域复制内置的 AI 提示词，粘贴给任意图像生成 AI 生成一套 PNG，打包成 ZIP 导入即可。

### 4. 应用到整个系统（Windows）
点「应用到系统」，当前主题写入 Windows 系统光标方案（注册表 + SPI_SETCURSORS），Explorer 和所有应用立即生效。macOS 提供实验性的 Swift 覆盖层（需辅助功能权限）。

## 四、个人主题：Fork 一个属于自己的

**方式 A（零代码）**：设置里「导出」当前配置成 ZIP，或用 AI 提示词生成一套，然后「导入」。

**方式 B（Fork 仓库）**：Fork 仓库后，把图片包放到 `assets/personal/<你的名字>/`，运行两个命令就能变成内置主题：

```bash
node scripts/import-personal-themes.mjs
node scripts/generate-assets.mjs
```

宣传图上带 **Personal** 徽章、排在最后的那个格子，就是你自己的主题——完全可以自定义并存在自己的仓库里。

## 五、项目信息

- 开源协议：MIT，完全免费
- GitHub：https://github.com/auki-zy/dsh-cursor-theme
- npm：https://www.npmjs.com/package/dsh-cursor-theme
- 已收录 DSH 插件市场（1024Store）

有什么问题欢迎在 GitHub 提 Issue，也欢迎提交自己的主题。

**CSDN 配图建议：**
| 位置 | 图片 | 说明 |
|---|---|---|
| 封面/开头 | `data/theme-packs/promo-banner.png` | 18+1 套主题 × 14 状态拼图，主图 |
| 使用教程处 | DSH 设置界面截图 | 打开设置 → 光标主题，截一张 |
| 系统应用处 | Windows 应用前后对比截图 | 应用前默认光标 vs 应用后主题光标 |
| 个人主题处 | `assets/personal/cat-sitiao/` 效果图 | Personal 徽章格子截图 |

---

## 3️⃣ 即刻 / 微博 / 朋友圈（短文案，三选一）

**版本 A（配拼图）：**
DSH 光标主题插件来了 🖱️ 18+1 套原创主题：猫爪、霓虹、像素、表情包、太空人……还能导入自己的 Personal 主题！一键套用，Windows 还能应用到整个系统。免费开源，AI 提示词内置，让 AI 帮你画整套光标。
GitHub: github.com/auki-zy/dsh-cursor-theme

**版本 B（配猫爪/像素特写）：**
写代码也要可爱 ✨ 给 DSH 换套猫爪光标，14 种鼠标状态全都有，还能整个 Windows 一起换。开源免费，喜欢哪个主题评论区说，考虑加新款式 🐾

**版本 C（配系统应用截图）：**
刚才把 DSH 的光标主题一键应用到了整个 Windows——系统里所有应用的光标都变成霓虹色了 🌃 插件开源：github.com/auki-zy/dsh-cursor-theme

**配图：** `data/theme-packs/promo-banner.png`

---

## 4️⃣ 小红书（图文）

**标题：**
把 DSH 的光标换成猫爪后，我写代码效率都高了（不是）

**正文：**
免费开源插件 dsh-cursor-theme 🖱️
- 14 种鼠标状态全覆盖
- 18+1 套主题：猫爪/霓虹/像素/表情包/太空人/幽灵/糖果……+ 你的 Personal 主题
- 能一键应用到整个 Windows 系统
- 内置 AI 提示词，让 AI 帮你画整套光标
- ZIP 图片包可导入导出

GitHub: github.com/auki-zy/dsh-cursor-theme
（安装教程见置顶评论）

**配图（3-6 张）：**
1. `data/theme-packs/promo-banner.png`（19 主题拼图）
2. 设置界面截图（设置 → 光标主题）
3. 猫爪光标在系统里的特写截图
4. 霓虹主题应用到系统的截图
5. AI 提示词 → 生成 → 导入流程图（可选）

---

## 5️⃣ X / Twitter（英文）

**版本 A（大众向）：**
Made a cursor theme plugin for DeepSeek Harness 🖱️
- 18+1 themes (paw, neon, pixel, emoji, astronaut… + your own Personal theme)
- all 14 mouse states covered
- one-click apply to the whole Windows system
- AI prompt included to generate your own set
Free & MIT. Try it: github.com/auki-zy/dsh-cursor-theme

**版本 B（开发者向）：**
Open-sourced dsh-cursor-theme — per-state cursor customization for DeepSeek Harness.
- 14 UI states, hotspot & size per state
- 18 baked themes via SVG templates + resvg, plus Personal themes (fork & import your own)
- system-level apply on Windows (registry + SPI_SETCURSORS)
- ZIP image packs with a copy-paste AI prompt
npm: npmjs.com/package/dsh-cursor-theme

**配图：** `data/theme-packs/promo-banner.png`

---

## 6️⃣ Reddit（英文，r/DeepSeek 等）

**标题：**
I made a cursor theme plugin for DeepSeek Harness — 19 themes (incl. your own Personal), applies to the whole Windows system

**正文：**
Made an open-source plugin that lets you change the mouse cursor for every UI state inside DSH (default, pointer, text, wait, not-allowed, resize…).

Highlights:
- 18 original themes: color palettes + creative ones (paw, neon, pixel, emoji, astronaut, origami, ghost, candy…) + **Personal themes** — fork the repo, add your own pack, it becomes a built-in preset
- ZIP image packs: export/share/import; includes an AI prompt so you can generate your own set
- Windows: one-click apply to the whole system (registry + SPI_SETCURSORS)
- Free, MIT

Repo: github.com/auki-zy/dsh-cursor-theme
Install: `dsh plugin --profile desktop add dsh-cursor-theme`

Happy to take theme requests / issues!

**配图：** `data/theme-packs/promo-banner.png`

---

## 7️⃣ Product Hunt（英文，如发布）

**Name:** dsh-cursor-theme
**Tagline:** Per-state cursor themes for DeepSeek Harness, with one-click system-level apply
**Description:**
dsh-cursor-theme lets you give every mouse state inside DeepSeek Harness its own cursor. 18 original themes (paw, neon, pixel, emoji, astronaut and more) + **Personal themes** cover all 14 UI states out of the box — fork the repo, add your own pack, it becomes a built-in preset. Themes ship as ZIP image packs you can export, share, import — or generate with an included AI prompt. On Windows, apply any theme to the whole OS cursor scheme in one click (registry + SPI_SETCURSORS); macOS gets an experimental overlay.
**链接：** https://github.com/auki-zy/dsh-cursor-theme
**配图：** `data/theme-packs/promo-banner.png`

---

## 8️⃣ DSH / DeepSeek 社区、微信群、QQ 群（口语化）

**首句：** 给 DSH 做了个光标主题插件，分享给大家

**正文：**
最近给 DeepSeek Harness 写了个小插件，可以自定义鼠标光标：
- 14 种鼠标状态全覆盖（点击、文本、等待、禁止、抓取、缩放这些都能单独换）
- 内置 18+1 套主题：极光、蜜糖、猫爪、霓虹、像素、表情包、太空人、幽灵、糖果……+ 你自己的 Personal 主题
- Windows 下能一键应用到整个系统，所有应用的光标一起变
- 支持导入导出 ZIP 图片包，还内置了 AI 提示词，可以让 AI 帮你画
- 免费开源

安装：`dsh plugin --profile desktop add dsh-cursor-theme`
GitHub：github.com/auki-zy/dsh-cursor-theme

---

## 发布顺序建议

1. **Day 1（今天）**：V2EX + 即刻/微博 + 微信朋友圈
2. **Day 2**：掘金/知乎长文 + 小红书
3. **Day 3-7**：B 站视频（可选）+ Reddit/X 英文帖
4. **持续**：根据反馈迭代新主题，二次宣传

## 配图速查

| 用途 | 文件 |
|---|---|
| 19 主题拼图（主图） | `data/theme-packs/promo-banner.png` |
| 主题细节截图 | 打开 DSH → 设置 → 光标主题，自行截图 |
| 系统应用对比 | Windows 应用前后各截一张 |
| AI 生成流程 | AI 提示词 → 生成 PNG → 导入 ZIP，分步截图 |
