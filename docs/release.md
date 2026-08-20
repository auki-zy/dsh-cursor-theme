# V1 发布与上架指南

> 阶段：V1 发布准备（M0–M3 全部完成，`npm run check` 全绿：23 个单测通过）
> 日期：2026-08-20
> 目标宿主：**[anywhere-labs/deepseek-harness-desktop](https://github.com/anywhere-labs/deepseek-harness-desktop)（DSH Desktop 2.0.1，内嵌 dsh 0.1.0-rc.7）**

---

## 0. deepseek-harness-desktop 插件规范对照（本插件已符合）

以官方内置市场 `dsh-community-market` 与托管安装文档（`docs/install-and-uninstall.md`）为基准：

| 规范要求 | 本插件 | 状态 |
|---|---|---|
| `dsh.bundle.patch` 存在且包内包含 | ✅ `cordis.patch.yml`（`- insert: id: dsh-cursor-theme`） | ✅ |
| 无 `preinstall`/`install`/`postinstall`/`prepare` 生命周期脚本 | ✅ scripts 仅 typecheck/build/test | ✅ |
| Node engine 接受内置 Node（官方：`^22.19.0 \|\| >=24.0.0`） | ✅ 已声明同款 engines | ✅ |
| DSH/Cordis 依赖兼容 rc.7 | ✅ peerDeps 均 rc.7 | ✅ |
| `exports["./client"]` 提供客户端 bundle | ✅ `./client/client.js` | ✅ |
| 宿主端模块级 `inject` 声明（官方形态） | ✅ `export const inject = ['settings']` | ✅ |
| 客户端模块级 `inject` 声明 + 官方集成面 | ✅ `['slots', 'locale']` + `settings.plugins.tab` | ✅ |
| 安装 profile | **desktop**（GUI 实际使用的 profile；`dsh.cmd` 的 `DSH_DESKTOP_DEFAULT_PROFILE=desktop`） | ✅ 已安装 |

> ⚠️ 重要：DSH Desktop GUI 运行的是 `desktop` profile，不是 `web`。装插件用
> `dsh plugin --profile desktop add <pkg>`；`--profile web` 只影响 CLI/浏览器跑法。
> 安装/卸载后必须**重启 DSH Desktop**（client-modules 的包元数据缓存不失效，重启才重扫）。

---

## 1. 发布清单（npm）

### 1.1 发布前确认

| 项 | 状态 |
|---|---|
| `npm run check`（typecheck + build + test） | ✅ 通过（23/23） |
| `npm pack --dry-run` 内容 | ✅ 13 个文件 / 30 kB |
| LICENSE（MIT） | ✅ 已添加 |
| README.md / README.zh.md | ✅ 双语 |
| `dsh.bundle` 声明（上架必需） | ✅ `cordis.patch.yml` |
| `dsh.client.inject`（客户端服务声明） | ✅ runtime/locale/primitives/ui-settings/ui-theme |
| types 指向 | ✅ `lib/index.d.ts`（已修正） |

### 1.2 发布命令

```sh
# 1) 本地全量校验
npm run check

# 2) 打包预览
npm pack --dry-run

# 3) 发布（注意：publishConfig.registry 指向 npmjs.org）
npm publish --access public

# 4) 在 profile 中安装验证
dsh plugin --profile web add dsh-cursor-theme@^0.1.0
```

> ⚠️ 本机 pnpm 配置了内网镜像（npm.mihoyo.com），`npm publish` 需要 npmjs.org 凭据。
> 若当前终端未登录 npmjs：先执行 `npm login`（或 `pnpm login --registry https://registry.npmjs.org`），
> 再按 `npm publish --registry https://registry.npmjs.org --access public` 发布。

### 1.3 版本建议

- 首版：`0.1.0`（MVP 完成度）
- 建议先发 `0.1.0-rc.1` 给社区试用，稳定后升 `0.1.0`

---

## 2. 上架 awesome-dsh-plugin

> 市场数据源：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
> 收录方式：在该仓库列表加一条即可，站点与 dshmarket 约一天内自动收录。
> 校验规则：包的 `repository` 必须指回同一仓库（防冒名）。

### 2.1 建议条目（PR 内容）

在 awesome-dsh-plugin 列表（`README.md` 或 `plugins.json` 数据）中添加：

```markdown
| [dsh-cursor-theme](https://github.com/auki-zy/dsh-cursor-theme) | theme |
| 在 DSH 中自定义鼠标各种状态的图案：按 UI 状态配置 PNG/CUR 光标、内置素材库、
  预设主题一键套用、热区与尺寸编辑、跟随亮暗主题、主题包导出/导入。 |
| Customize the PC mouse cursor for every UI state in DSH: per-state PNG/CUR
  images, built-in asset library, one-click themes, hotspot & size editing,
  light/dark follow, theme pack export/import. |
```

### 2.2 分类建议

- 主分类：`theme`（与皮肤类插件相邻曝光）
- 若市场支持子分类，可申请 `cursor` 子类

### 2.3 上架前置

1. 先把代码推到公开 GitHub 仓库（当前在工作区本地，未建远程）
2. 确保 `package.json.repository` 指向该仓库（当前缺失，发布前需补充）
3. 发布 npm 包（见 §1）
4. 提 PR 到 awesome-dsh-plugin

---

## 3. 发布说明（CHANGELOG v0.1.0）

### 新增

- **M0 骨架**：Cordis bundle 接入 web profile，客户端 `__ModuleLoader__` 契约注入
- **M1 注入核心**：14 个 UI 状态映射（default/pointer/text/wait/help/not-allowed/grab/grabbing/progress/cell/copy/move/resize-ew/resize-ns），cursor CSS 生成器（必带 fallback），配置持久化到 dsh-settings
- **M2 设置界面**：设置 → 插件 → 光标主题；状态列表、PNG/CUR 上传（≤128×128、≤512KB 校验）、热区 X/Y 编辑、尺寸档位、实时预览、一键还原；中英双语
- **M3 打磨**：
  - 内置素材库 21 个（7 形状 × 3 色板，手写 PNG 编码生成，零依赖）
  - 预设主题 4 套（Mono Dark / Mono Light / Neon / High Contrast）一键套用
  - 主题包导出/导入 JSON（base64 内嵌，完整校验，2MB/512KB 上限）
  - 跟随 DSH 亮暗主题（theme 服务订阅，浅色 UI ↔ 深色光标自动切换）
  - 无障碍：fallback 兜底 + 对比度提示
- **工程质量**：esbuild 单文件打包（0 相对 require）、23 个单元测试、`npm run check` 一键校验

### 已知限制（v0.1）

- 系统级光标（Windows 指针方案）未实现，见 docs/feasibility.md 方案 B（v2 远期）
- SVG/GIF/ANI 素材不支持（Chromium 限制），主推 PNG/CUR
- 光标图片 >128px 会被浏览器忽略（生成器已按 32×32 生成，上传已校验）

---

## 4. 待办（发布前需用户完成）

- [ ] 初始化 Git 仓库并推送到 GitHub（含 `package.json.repository` 字段）
- [ ] npmjs.org 登录并执行发布（§1.2）
- [ ] 提 PR 到 awesome-dsh-plugin（§2.1 条目）
- [ ] 重启 DSH GUI 实测（M0–M3 功能均需重启后验证）
