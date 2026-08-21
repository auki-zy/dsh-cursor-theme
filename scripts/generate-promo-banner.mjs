/**
 * Generate a promotional banner image for dsh-cursor-theme.
 *
 * Composes all 18 preset themes (their default-state PNG from
 * data/theme-packs/<id>.zip) into a 4x5 grid with name labels, plus a
 * header band. Rendered with @resvg/resvg-js (pure Node, no browser).
 *
 * Output: data/theme-packs/promo-banner.png (1600x1040)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import JSZip from 'jszip'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const packsDir = join(root, 'data', 'theme-packs')

// theme display order: id -> label (same order as assets.json)
const THEMES = [
  ['astro', 'Astro 太空人'], ['aurora', 'Aurora 极光'], ['candy', 'Candy 糖果'],
  ['contrast', 'Contrast 高对比'], ['emoji', 'Emoji 表情'], ['energy', 'Energy 能量'],
  ['ghost', 'Ghost 幽灵'], ['graphite', 'Graphite 石墨'], ['hivis', 'Hi-Vis XL 放大'],
  ['honey', 'Honey 蜜糖'], ['mint', 'Mint 薄荷'], ['neon', 'Neon 霓虹'],
  ['origami', 'Origami 折纸'], ['paw', 'Paw 猫爪'], ['pixel', 'Pixel 像素'],
  ['pop', 'Pop 波普'], ['sunset', 'Sunset 晚霞'], ['weather', 'Weather 天气'],
]

const COLS = 4
const ROWS = Math.ceil(THEMES.length / COLS) // 5
const CELL_W = 400
const CELL_H = 190
const HEADER_H = 90
const W = COLS * CELL_W // 1600
const H = HEADER_H + ROWS * CELL_H // 1040

// dark background, rounded cells, soft grid
const BG = '#0f172a'
const CELL_BG = '#1e293b'
const ACCENT = '#5a7dff'
const TEXT = '#e2e8f0'
const SUBTEXT = '#94a3b8'

/** Load default-state PNG bytes from a theme pack zip. */
async function loadDefaultPng(id) {
  const zip = await JSZip.loadAsync(readFileSync(join(packsDir, `${id}.zip`)))
  const manifest = JSON.parse(await zip.file('manifest.json').async('string'))
  const file = manifest.states.default.file
  return await zip.file(file).async('uint8array')
}

/** Escape XML text. */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const cells = []
for (let i = 0; i < THEMES.length; i++) {
  const [id, label] = THEMES[i]
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const x = col * CELL_W
  const y = HEADER_H + row * CELL_H
  const png = await loadDefaultPng(id)
  const b64 = Buffer.from(png).toString('base64')
  cells.push(`
    <g>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="${CELL_BG}"/>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="none" stroke="#334155" stroke-width="1.5"/>
      <image href="data:image/png;base64,${b64}" x="${x + CELL_W / 2 - 48}" y="${y + 26}" width="96" height="96"/>
      <text x="${x + CELL_W / 2}" y="${y + 152}" text-anchor="middle" font-family="sans-serif" font-size="19" font-weight="700" fill="${TEXT}">${esc(label)}</text>
    </g>`)
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="${HEADER_H}" fill="#0b1220"/>
  <rect x="0" y="${HEADER_H - 2}" width="${W}" height="2" fill="${ACCENT}"/>
  <text x="40" y="42" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}">dsh-cursor-theme</text>
  <text x="40" y="72" font-family="sans-serif" font-size="20" fill="${SUBTEXT}">18 original cursor themes for DeepSeek Harness · 14 mouse states each</text>
  <text x="${W - 40}" y="46" text-anchor="end" font-family="sans-serif" font-size="20" font-weight="700" fill="${ACCENT}">github.com/auki-zy/dsh-cursor-theme</text>
  ${cells.join('\n')}
</svg>`

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } })
const png = resvg.render().asPng()
const outPath = join(packsDir, 'promo-banner.png')
writeFileSync(outPath, png)
console.log(`wrote ${outPath} (${W}x${H}, ${png.length} bytes)`)
