# 个人资源（Personal Assets）

本项目作者的个人素材收纳目录，与**默认资源**分开管理。

## 默认资源（插件内置，勿放入本目录）

| 位置 | 内容 |
|---|---|
| `data/assets.json` | 内置 SVG 形状模板清单（由 `scripts/generate-assets.mjs` 生成） |
| `src/client/svg-assets.ts` | 形状模板源码（生成 `assets.json` 的输入） |
| `data/theme-packs/`、`data/themes-*.json` | 预设主题包（`scripts/generate-theme-packs.mjs` 生成） |
| `assets/mac-cursor-overlay.swift` | macOS 系统光标覆盖层源码 |

## 本目录约定

- 仅用于**人工收纳** PNG / CUR 等图片素材文件（可自行按状态命名，如 `pointer.png`、`wait.cur`，便于查找）。
- **不参与构建**：`scripts/generate-assets.mjs` 不会扫描本目录，素材不会被打进客户端 bundle。
- **页面不体现**：设置页/素材选择器不展示本目录，也不做任何来源区分。
- 若素材需要进入插件素材库，请走正常途径：把文件放到内置素材生成流程，或通过设置页「上传图案」/「图片包导入」使用。

## 注意

- 本目录**不会随 npm 包发布**：`package.json` 的 `files` 通过 `!assets/personal` 排除了它（`assets/` 下其余文件如 `mac-cursor-overlay.swift` 仍正常打包）。
- 素材版权与体积请自行把控；体积较大的文件建议不要提交到 git（可加入 `.gitignore`）。
