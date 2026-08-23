# dsh-cursor-theme 发布流程（Release SOP）

> 规范化的发布操作手册。以 **v0.2.0** 发布为基线整理，适用于后续所有版本发布。
> 覆盖：版本规划 → 校验 → 打包 → git 提交/打 Tag/推送 → npm 发布 → 市场收录确认。

---

## 0. 前置条件

| 项 | 说明 |
|---|---|
| 环境 | 本机 Windows + Git（`C:\Program Files\Git\cmd\git.exe`）；Node 22+/pnpm（DSH runtime 提供） |
| GitHub 凭据 | 可 push 到 `auki-zy/dsh-cursor-theme`（Git Credential Manager 已缓存即可） |
| npm 凭据 | `~/.npmrc` 含 npmjs 发布 token（bypass 2FA 类型，形如 `//registry.npmjs.org/:_authToken=npm_xxx`） |
| 网络 | GitHub 与 registry.npmjs.org 可达；国内网络不稳时需代理（见 §6） |

> ⚠️ 安全：npm token 是敏感凭据，发布完成后建议在 npmjs.com 撤销/轮换；
> 不要提交任何含 token 的文件。

---

## 1. 版本规划（SemVer）

| 变更类型 | 版本示例 | 示例场景 |
|---|---|---|
| 破坏性/大功能 | `0.x.0`（minor） | 新增系统级光标、导入交互重构 |
| 新功能（向后兼容） | `0.x.0` | 拖拽导入、热区校准、5MB 上限 |
| 修复 | `0.x.y`（patch） | BOM 容错、抠图修复、文案修正 |

- 当前已发布：`0.1.0`、`0.2.0`。
- 版本号修改位置：`package.json` 的 `version` 字段。

---

## 2. 发布前检查

```sh
pnpm run typecheck      # host + client 两个 tsconfig
pnpm test               # vitest 全量（当前 44 个用例）
pnpm run build:client   # 重建 client/client.js（若改了客户端代码）
pnpm run build          # 宿主端 lib/（注意：内部 npm run 依赖 npm，见 §6）
```

- 确认 `git status` 干净或改动符合预期。
- 若改了 `docs/catalog/v1/plugins.json`（市场目录源），一并提交。

---

## 3. 执行发布

### 3.1 bump 版本

编辑 `package.json` → `version: "0.x.y"`。

### 3.2 更新市场 catalog（可选但建议）

`docs/catalog/v1/plugins.json`：

- `latestVersion` → 新版本号；
- `generatedAt` / `revision` → 当前 UTC 时间。

> 该文件同时是 GitHub Pages 部署的目录源（`manifest.json` 的 transport
> endpoint 指向 `https://auki-zy.github.io/dsh-cursor-theme/catalog/v1/plugins.json`），
> 推送到 GitHub 后由 Pages 提供。

### 3.3 提交 + Tag + 推送

```sh
git add package.json docs/catalog/v1/plugins.json
git commit -m "chore: release v0.x.y"
git tag v0.x.y
git push origin master --tags
```

### 3.4 npm 发布

```sh
# 打包预览（不实际上传）
pnpm pack --config.ignore-scripts=true --dry-run
# 检查 tarball：assets/mac-cursor-overlay.swift 应在、assets/personal 不应在

# 实际发布（本机无 npm 命令，用 pnpm；跳过会失败的 prepublish 脚本）
pnpm publish --config.ignore-scripts=true
```

验证：

```sh
pnpm view dsh-cursor-theme version   # 应为新版本号
```

> `--config.ignore-scripts=true` 跳过 prepublishOnly（内部 `npm run check`
> 依赖 npm，本机 PATH 无 npm 会失败；产物已在 §2 手动构建验证，跳过安全）。

---

## 4. 市场收录确认

| 市场 | 机制 | 发布后是否需要操作 |
|---|---|---|
| **npm** | 直接发布 | 已发布即收录 |
| **1024Store**（`imsai-sh/awesome-deepseek-harness-plugins`） | 仓库 `catalog/plugins/auki-zy--dsh-cursor-theme.json` 条目；**不记录版本号**（`added` 日期 + `repository` 引用，市场自动反映最新） | 无需操作（条目已存在） |
| **dshfind**（dshfind.com / `hikariming/dshfind`） | **自动聚合 GitHub topic `dsh-plugin`**（`pnpm gen:data`） | 无需操作（仓库已打 `dsh-plugin` topic；如需新增其它 topic 自行添加） |

- 若条目不存在（如换仓库名），才需要走 PR 流程：fork → 修改 → PR。
- 1024Store 条目文件：`catalog/plugins/auki-zy--dsh-cursor-theme.json`
  （schema: `../schema/plugin.schema.json`，字段：id / name / repository / category / description.en/zh / added）。

---

## 5. 发布后收尾

- [ ] `pnpm view dsh-cursor-theme` 确认版本
- [ ] GitHub Actions / Pages 部署成功（若有）
- [ ] DSH Desktop 插件市场可见新版本（重启 DSH 或市场刷新）
- [ ] 更新 README 的 npm / 市场链接（如描述有变）
- [ ] 更新 `docs/release.md` 或 RELEASE_NOTES（变更日志）

---

## 6. 常见问题

| 问题 | 处理 |
|---|---|
| `npm` 命令不存在（PATH） | 用 `pnpm` 替代（`pnpm publish` / `pnpm pack`） |
| `pnpm pack` 的 `files` 排除 `assets/personal` 失效 | 排除写在 `files` 里会被 pnpm 误删整个 `assets/`；**直接用文件白名单** `"assets/mac-cursor-overlay.swift"`（不加目录 + 否定模式） |
| push 报 `Connection was reset` | GitHub 网络不通；开代理后重试：`git -C <repo> -c http.proxy=http://127.0.0.1:<port> push origin master --tags` |
| publish 报 401/403 | `~/.npmrc` token 失效 → npmjs.com 重新生成 bypass 2FA token 写入 |
| 忘记打 Tag | `git tag v0.x.y <commit>` + `git push origin v0.x.y` |
| `.pnpm-store/`、`assets/personal/_originals/` 被 git 跟踪 | 已在 `.gitignore` 排除；新增大数据目录记得同样处理 |

---

## 7. 历史发布记录

- **v0.2.0**（2026-08-23）：图片包拖拽/点击导入、单图上限 5MB、manifest BOM 容错、超大图自动缩放；恢复系统默认同步还原系统光标；状态编辑弹窗热区可视化校准；编辑弹窗 UI 精简；发布包排除 assets/personal。
- **v0.1.0**（2026-08-21）：首个发布。14 状态光标自定义、18 套预设主题、内置素材库、主题包导入/导出、Windows 系统级应用、macOS 实验性覆盖层。
