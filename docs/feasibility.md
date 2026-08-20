# dsh-cursor-theme 可行性分析

> 项目：dsh-cursor-theme —— 在 DeepSeek Harness 中自定义鼠标各状态图案
> 版本：v0.1（草案）
> 日期：2026-08-20

---

## 1. 结论摘要

| 维度 | 结论 |
|---|---|
| 技术可行性 | ✅ **完全可行**（应用内光标）；系统级光标为 ⚠️ 部分可行（需桌面桥接，属远期） |
| 平台覆盖 | ✅ DSH Web / DSH Desktop（Electron）均可；原生基于 CSS `cursor` 属性 |
| 实现成本 | 低～中。MVP 约 1 个客户端插件 + 少量宿主端服务 |
| 主要风险 | 光标图片格式兼容性、热区（hotspot）限制、DSH 主题系统联动、CSP/资源加载 |
| 建议 | 做 **应用内光标主题** 起步，系统级（改 Windows 鼠标指针方案）列为远期 |

---

## 2. 技术基础：CSS cursor 能力盘点

鼠标光标在 Web 平台本质上就是 CSS `cursor` 属性，DSH 的 Web UI 是 React + 浏览器渲染，因此完全在可控范围内。

### 2.1 支持的取值

- 关键字：`default`、`pointer`、`text`、`wait`、`help`、`crosshair`、`move`、`not-allowed`、`grab`、`grabbing`、`progress`、`cell`、`copy`、`alias`、`context-menu`、`zoom-in`、`zoom-out`、`col-resize`、`row-resize`、8 个方向 resize、`none` 等 —— 覆盖了用户能感知的绝大多数"鼠标状态"
- 自定义图片：`cursor: url('pointer.png') 4 4, auto;` —— 图片 + 热区坐标 + 回退关键字

### 2.2 图片格式与兼容性（Chromium / Electron / 现代浏览器）

| 格式 | Chromium | 说明 |
|---|---|---|
| PNG（推荐） | ✅ | 支持透明通道；最佳兼容性 |
| SVG | ⚠️ | Chromium 对 SVG cursor 支持有限，**热区坐标无效**，需回退 |
| GIF | ⚠️ | 只显示第一帧，无动画 |
| CUR（Windows 光标） | ✅ | 支持静态，热区内嵌 |
| ANI（Windows 动画光标） | ❌ | Chromium 不支持动画光标 |

**结论**：主推 **PNG + 热区坐标**；CUR 作为 Windows 桌面端增强。

### 2.3 尺寸限制

- 主流浏览器对 cursor 图片尺寸上限约 **128×128**（超出会整体忽略并回退）
- Windows 上超过 32×32 的光标会被系统缩放/变形
- **建议**：素材库控制在 16/24/32/48 四档，超过 128 时 UI 给出提示

### 2.4 热区（hotspot）

- 语法：`cursor: url(pointer.png) 4 4, auto;` —— 第二个参数是热区坐标（像素，从左上角）
- PNG 必须显式指定热区；CUR 内嵌热区
- 不指定时默认为 (0,0)，点击响应会偏左上，**必须给用户可视化热区编辑器**

---

## 3. DSH 平台能力（基于本地源码确认）

已核对本机 DSH Desktop 11.7.0（dsh 0.1.0-rc.7）的插件机制：

| 能力 | 位置 | 用途 |
|---|---|---|
| 客户端插件注入 | `dsh.client.inject` + `client/client.js`（`window.__ModuleLoader__.load`） | 向 Web 端注入 JS/CSS |
| 样式注入 | `document.head.appendChild(style)`，`data-plugin-css` 去重（见 dsh-client-ui-theme） | **本插件的核心**：注入全局 `cursor` 规则 |
| 设置页插槽 | `@deepseek-ai/dsh-client-ui-settings` | 在 设置 → 插件 中展示配置界面 |
| 持久化 | `dsh-settings` / `dsh-storage-*` / 客户端 store | 保存用户主题与状态配置 |
| 宿主端服务 | `lib/index.js` 导出 `apply(ctx)`，可注入 `webServer` 等 | 提供路由、素材接口、CLI 辅助 |
| 主题联动 | `@deepseek-ai/dsh-client-ui-theme` 的 preference（light/dark/system） | 深浅色光标主题切换 |

---

## 4. 两种目标范围与可行性对比

### 4.1 方案 A：应用内光标主题（推荐，MVP）

**做法**：插件向 DSH Web UI 注入一段全局 CSS，按 UI 状态覆盖 `cursor`；用户在设置页里为每个状态挑选/上传图案，配置保存到 profile。

- ✅ 纯前端实现，无需系统权限
- ✅ 跨平台（Windows / macOS / Linux / 浏览器跑 DSH Web 都一样）
- ✅ 与 DSH 的 HMR/重启机制天然兼容（样式随 profile 加载）
- ⚠️ 只影响 DSH 应用窗口内，**不影响** Windows 桌面上其他程序的光标

### 4.2 方案 B：系统级鼠标指针方案（远期）

**做法**：通过 DSH Desktop 的宿主桥接（`dsh-plugin-desktop` 已有 windows 相关服务）写注册表 `HKCU\Control Panel\Cursors` 并广播 `WM_SETTINGCHANGE`。

- ✅ 全系统生效（Explorer、其他应用）
- ❌ 仅限 Windows；macOS/Linux 无统一方案（macOS 需辅助功能权限改系统指针，基本不可行）
- ❌ 修改系统注册表属于敏感操作，需额外权限/确认
- ❌ 与 DSH Desktop 的 Electron 进程模型耦合，纯 `dsh web`（浏览器）无法实现

**决策**：MVP 只做方案 A；方案 B 作为 v2 远期，需要桌面插件协作。

---

## 5. 风险与缓解

| # | 风险 | 等级 | 缓解 |
|---|---|---|---|
| 1 | SVG/GIF/ANI 格式兼容性陷阱 | 中 | 素材库只收 PNG/CUR；上传时格式校验并提示 |
| 2 | 热区缺失导致点击偏位 | 中 | 提供热区可视化编辑器 + 默认值 (0,0) 提示 |
| 3 | 图片超过 128px 被忽略 | 低 | UI 上限校验 + 内置缩放 |
| 4 | 与 DSH 主题/组件 `cursor` 规则冲突 | 中 | 用足够高的优先级注入（`:root` 级 + 按状态的选择器），并在需求文档中列冲突矩阵 |
| 5 | CSP 限制内联样式/资源 | 中 | 走标准 `data-plugin-css` 样式注入通道（官方同款机制，已兼容）；素材走 data URL / 插件静态资源 |
| 6 | 无网络时素材加载失败 | 低 | 素材存 profile（本地文件/data URL），内置库打包进插件 |
| 7 | 每状态逐一配置成本高 | 低 | 提供"主题包"一次套用 + 继承默认值 |
| 8 | 无障碍（低对比度/色弱） | 低 | 提供"跟随系统主题"与高对比方案 |

---

## 6. 技术架构草案

```
┌─────────────────────────────────────────────────┐
│  DSH Web（浏览器 / Electron 渲染进程）            │
│                                                 │
│  client/client.js（本插件客户端）                 │
│   ├─ 注入全局 <style data-plugin-css>            │
│   ├─ 设置页 UI（settings 插槽）                  │
│   │    └─ 状态图案选择 / 上传 / 热区编辑 / 预览    │
│   └─ 持久化（dsh-settings / client store）        │
└─────────────────────────────────────────────────┘
              │ (HTTP / 服务调用)
┌─────────────────────────────────────────────────┐
│  dsh 宿主进程（lib/index.js，Cordis 插件）        │
│   ├─ 素材注册表：内置素材 / 用户上传素材存取        │
│   ├─ 主题包管理（JSON 结构）                     │
│   └─ （远期）桌面桥接：系统级指针方案             │
└─────────────────────────────────────────────────┘
```

**核心数据结构**（草案，详见需求文档 §7）：

```jsonc
{
  "activeTheme": "my-theme",
  "states": {
    "default":    { "image": "data:image/png;base64,...", "hotspot": [0, 0], "size": 32 },
    "pointer":    { "image": "...", "hotspot": [4, 4], "size": 32 },
    "text":       { "image": "...", "hotspot": [4, 4], "size": 32 }
    // wait / help / not-allowed / grab / grabbing / progress / cell / copy / move / resize* ...
  },
  "fallback": "auto",
  "enabled": true
}
```

---

## 7. 结论

1. **应用内光标自定义完全可行**，且与 DSH 现有客户端插件机制（样式注入 + 设置插槽 + 持久化）天然契合，实现路径清晰。
2. 主推 **PNG + 热区坐标 + 尺寸档位**，规避格式兼容性风险。
3. **系统级光标**（改 Windows 指针方案）不可作为 MVP，列为远期（需桌面插件桥接 + 仅 Windows）。
4. 建议先交付 MVP（方案 A），验证用户价值后再评估系统级扩展。

> 下一份文档：《需求文档》（docs/requirements.md）—— 完整需求点、用户故事、优先级、验收标准。
