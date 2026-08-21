# v0.1.0 — First release 🎉

Per-state mouse cursor themes for **DeepSeek Harness (DSH)** — every UI state gets its own cursor, with 18 original preset themes and one-click system-level apply on Windows.

## ✨ Highlights

- **18 original preset themes**, each covering **all 14 mouse states** (default, pointer, text, wait, help, not-allowed, grab, grabbing, progress, cell, copy, move, resize-ew, resize-ns):
  - 6 color palettes: Aurora · Honey · Mint · Sunset · Graphite · High Contrast
  - 12 creative themes: **Paw 🐾 · Energy ⚡ · Neon 🌃 · Emoji 😀 · Pixel 👾 · Weather ⛅ · Origami 📐 · Astro 🧑🚀 · Candy 🍬 · Ghost 👻 · Hi-Vis XL 🔍 (48px) · Pop 🎈**
- **One-click system-level apply (Windows)**: writes the theme into the OS cursor scheme (registry + `SPI_SETCURSORS`) — Explorer and every app pick it up immediately. macOS: experimental Swift overlay + Accessibility guidance.
- **ZIP image packs**: export / share / import any theme; includes a copy-paste **AI prompt** to generate your own set.
- Per-state SVG template library (25 shapes) + upload PNG/CUR, hotspot (click point) editing, sizes 16/24/32/48.
- Accessibility-first: every rule carries a fallback keyword — failed images degrade to the system cursor, never `none`.
- Bilingual UI (zh/en), persisted to the profile.

## 📦 Install

```sh
# DSH Desktop (desktop profile)
dsh plugin --profile desktop add dsh-cursor-theme

# dsh web / browser (optional)
dsh plugin --profile web add dsh-cursor-theme
```

Then open **Settings → Cursor Theme**.

## 🖼️ The 18 themes

See the banner attachment for a visual overview of all themes.

## 🔗 Links

- Repository: https://github.com/auki-zy/dsh-cursor-theme
- npm: https://www.npmjs.com/package/dsh-cursor-theme
- Catalog entry (1024Store): https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/catalog/plugins/auki-zy--dsh-cursor-theme.json

## 📄 License

MIT
