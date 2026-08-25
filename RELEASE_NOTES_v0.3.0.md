# v0.3.0 — 宣传图全面升级 + Personal 主题支持 🎨

Per-state mouse cursor themes for **DeepSeek Harness (DSH)** — 18+1 original themes, all 14 mouse states each, one-click system-level apply on Windows.

## ✨ Highlights

- **🎨 New promo banner**: every theme cell now shows **all 14 mouse-state icons** (4×4 grid) — one glance tells you "one theme = full state coverage"
- **👤 Personal themes**: fork the repo, drop your pack in `assets/personal/<name>/`, run `import-personal-themes.mjs` — it becomes a built-in preset (example included: **cat-sitiao / sleepy-white-cat**). Personal themes appear last in the banner with a dashed **Personal** badge
- **↔️ Rich markdown ↔ Notion conversion**: `import-markdown-to-notion.mjs` converts markdown to Notion rich text (bold/code/links/tables/lists) — write in Notion, publish to the blog (see the author's blog pipeline)
- **🔧 Banner generator**: dynamic theme list from `assets.json`, auto-includes personal themes

## 📦 Install

```sh
dsh plugin --profile desktop add dsh-cursor-theme
```

Then open **Settings → Cursor Theme**.

## 🖼️ The themes

See the banner attachment (all 19 themes × 14 states).

## 🔗 Links

- Repository: https://github.com/auki-zy/dsh-cursor-theme
- npm: https://www.npmjs.com/package/dsh-cursor-theme
- CSDN tutorial: coming soon

## 📄 License

MIT
