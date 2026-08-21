# dsh-cursor-theme · 复制即贴宣传清单

> 使用方法：每个平台一段，复制后粘贴即可。配图路径均为项目内文件，发布时上传对应图片。
> 常用链接：
> - GitHub: https://github.com/auki-zy/dsh-cursor-theme
> - npm: https://www.npmjs.com/package/dsh-cursor-theme
> - Release: https://github.com/auki-zy/dsh-cursor-theme/releases/tag/v0.1.0
> - 安装: `dsh plugin --profile desktop add dsh-cursor-theme`
> - 宣传拼图: `data/theme-packs/promo-banner.png`（1600×1040）

---

## 1️⃣ V2EX（技术社区）

**标题：**
为 DeepSeek Harness 做了个鼠标光标主题插件，18 套主题 + 可应用到系统级

**正文：**
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

**配图：** `data/theme-packs/promo-banner.png`

---

## 2️⃣ 掘金 / 知乎 / CSDN（技术博客长文）

**标题（三选一）：**
- 给 AI 编程助手换光标？我做了个 18 套主题的 DSH 插件
- DSH 插件开发实战：从零做一个支持系统级应用的光标主题插件
- 开源一个 DSH 光标主题插件：14 种状态全覆盖 + 18 套原创主题

**正文：**

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
GitHub：https://github.com/auki-zy/dsh-cursor-theme
npm：https://www.npmjs.com/package/dsh-cursor-theme
安装：`dsh plugin --profile desktop add dsh-cursor-theme`

**配图：** 封面用 `data/theme-packs/promo-banner.png`，正文可穿插主题细节截图

---

## 3️⃣ 即刻 / 微博 / 朋友圈（短文案，三选一）

**版本 A（配拼图）：**
DSH 光标主题插件来了 🖱️ 18 套原创主题：猫爪、霓虹、像素、表情包、太空人……一键套用，Windows 还能应用到整个系统。免费开源，AI 提示词内置，让 AI 帮你画整套光标。
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
- 18 套原创主题：猫爪/霓虹/像素/表情包/太空人/幽灵/糖果……
- 能一键应用到整个 Windows 系统
- 内置 AI 提示词，让 AI 帮你画整套光标
- ZIP 图片包可导入导出

GitHub: github.com/auki-zy/dsh-cursor-theme
（安装教程见置顶评论）

**配图（3-6 张）：**
1. `data/theme-packs/promo-banner.png`（18 主题拼图）
2. 设置界面截图（设置 → 光标主题）
3. 猫爪光标在系统里的特写截图
4. 霓虹主题应用到系统的截图
5. AI 提示词 → 生成 → 导入流程图（可选）

---

## 5️⃣ X / Twitter（英文）

**版本 A（大众向）：**
Made a cursor theme plugin for DeepSeek Harness 🖱️
- 18 original themes (paw, neon, pixel, emoji, astronaut…)
- all 14 mouse states covered
- one-click apply to the whole Windows system
- AI prompt included to generate your own set
Free & MIT. Try it: github.com/auki-zy/dsh-cursor-theme

**版本 B（开发者向）：**
Open-sourced dsh-cursor-theme — per-state cursor customization for DeepSeek Harness.
- 14 UI states, hotspot & size per state
- 18 baked themes via SVG templates + resvg
- system-level apply on Windows (registry + SPI_SETCURSORS)
- ZIP image packs with a copy-paste AI prompt
npm: npmjs.com/package/dsh-cursor-theme

**配图：** `data/theme-packs/promo-banner.png`

---

## 6️⃣ Reddit（英文，r/DeepSeek 等）

**标题：**
I made a cursor theme plugin for DeepSeek Harness — 18 themes, applies to the whole Windows system

**正文：**
Made an open-source plugin that lets you change the mouse cursor for every UI state inside DSH (default, pointer, text, wait, not-allowed, resize…).

Highlights:
- 18 original themes: color palettes + creative ones (paw, neon, pixel, emoji, astronaut, origami, ghost, candy…)
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
dsh-cursor-theme lets you give every mouse state inside DeepSeek Harness its own cursor. 18 original themes (paw, neon, pixel, emoji, astronaut and more) cover all 14 UI states out of the box. Themes ship as ZIP image packs you can export, share, import — or generate with an included AI prompt. On Windows, apply any theme to the whole OS cursor scheme in one click (registry + SPI_SETCURSORS); macOS gets an experimental overlay.
**链接：** https://github.com/auki-zy/dsh-cursor-theme
**配图：** `data/theme-packs/promo-banner.png`

---

## 8️⃣ DSH / DeepSeek 社区、微信群、QQ 群（口语化）

**首句：** 给 DSH 做了个光标主题插件，分享给大家

**正文：**
最近给 DeepSeek Harness 写了个小插件，可以自定义鼠标光标：
- 14 种鼠标状态全覆盖（点击、文本、等待、禁止、抓取、缩放这些都能单独换）
- 内置 18 套主题：极光、蜜糖、猫爪、霓虹、像素、表情包、太空人、幽灵、糖果……
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
| 18 主题拼图（主图） | `data/theme-packs/promo-banner.png` |
| 主题细节截图 | 打开 DSH → 设置 → 光标主题，自行截图 |
| 系统应用对比 | Windows 应用前后各截一张 |
| AI 生成流程 | AI 提示词 → 生成 PNG → 导入 ZIP，分步截图 |
