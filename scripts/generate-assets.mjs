/**
 * dsh-cursor-theme asset generator (M5).
 *
 * Emits SVG shape templates (src/client/svg-assets.ts) plus theme definitions
 * (palette + full 14-state template mapping) into data/assets.json. PNGs are
 * rendered at runtime by the browser (canvas, render.ts) by substituting each
 * theme's palette into the templates — so EVERY theme covers ALL states.
 *
 * data/assets.json shape:
 *   { schema, generatedAt, templates: [...], themes: [{ id, name, description,
 *     palette: { primary, accent, dark }, states: { <stateId>: <templateId> } }] }
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

const out = buildSync({
  entryPoints: [join(root, 'src', 'client', 'svg-assets.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  write: false,
})
const mod = { exports: {} }
new Function('module', 'exports', out.outputFiles[0].text)(mod, mod.exports)
const { SVG_TEMPLATES } = mod.exports

/** All 14 state ids in display order (matches client states table). */
const ALL_STATES = [
  'default', 'pointer', 'text', 'wait', 'help', 'not-allowed', 'grab',
  'grabbing', 'progress', 'cell', 'copy', 'move', 'resize-ew', 'resize-ns',
]

/** Default functional template id for each state. */
const FUNCTIONAL = {
  default: 'shape-default',
  pointer: 'shape-pointer',
  text: 'shape-text',
  wait: 'shape-wait',
  help: 'shape-help',
  'not-allowed': 'shape-not-allowed',
  grab: 'shape-grab',
  grabbing: 'shape-grab',
  progress: 'shape-progress',
  cell: 'shape-cell',
  copy: 'shape-copy',
  move: 'shape-move',
  'resize-ew': 'shape-resize-ew',
  'resize-ns': 'shape-resize-ns',
}

/**
 * Build a complete theme: every state mapped (functional by default, with
 * optional mascot overrides for decorative states).
 */
function theme(id, name, description, palette, mascot) {
  const states = { ...FUNCTIONAL }
  if (mascot) {
    if (mascot.default) states.default = mascot.default
    if (mascot.pointer) states.pointer = mascot.pointer
    if (mascot.wait) states.wait = mascot.wait
    if (mascot.help) states.help = mascot.help
    if (mascot.notAllowed) states['not-allowed'] = mascot.notAllowed
  }
  return { id, name, description, palette, states }
}

const themes = [
  theme('classic-dark', 'Classic Dark', 'Clean monochrome cursors for light UIs', { primary: '#3a3a44', accent: '#141418', dark: '#000000' }),
  theme('coral-cat', 'Coral Cat', 'Warm pink cat-girl style', { primary: '#ff9fb2', accent: '#ff6b81', dark: '#7a2d3a' }, { default: 'mascot-cat', pointer: 'mascot-paw' }),
  theme('lemon-dog', 'Lemon Dog', 'Cheerful yellow dog', { primary: '#ffe066', accent: '#ffb300', dark: '#6b4d00' }, { default: 'mascot-dog', pointer: 'mascot-paw' }),
  theme('sky-shark', 'Sky Shark', 'Playful blue shark', { primary: '#5ac8fa', accent: '#0a84ff', dark: '#0a3d5c' }, { default: 'mascot-shark' }),
  theme('mint-penguin', 'Mint Penguin', 'Cool mint penguin', { primary: '#7ae5c0', accent: '#2ecc9b', dark: '#145c44' }, { default: 'mascot-penguin' }),
  theme('grape-ghost', 'Grape Ghost', 'Spooky purple ghost', { primary: '#c39bff', accent: '#8b5cf6', dark: '#3b1f66' }, { default: 'mascot-ghost' }),
  theme('alien-neon', 'Alien Neon', 'Extraterrestrial neon', { primary: '#00e5ff', accent: '#7c4dff', dark: '#00334d' }, { default: 'mascot-alien' }),
  theme('sky-whale', 'Sky Whale', 'Calm whale (DSH spirit)', { primary: '#6db6ff', accent: '#2f6fdb', dark: '#123a75' }, { default: 'mascot-whale' }),
  theme('blush-hearts', 'Blush Hearts', 'Romantic pink hearts', { primary: '#ffb3c6', accent: '#ff6fae', dark: '#7a2046' }, { default: 'mascot-heart', pointer: 'mascot-heart' }),
  theme('honey-bee', 'Honey Bee', 'Busy-bee yellow', { primary: '#ffd94d', accent: '#ff9f1a', dark: '#6b4a00' }, { default: 'mascot-bee', wait: 'mascot-bee' }),
  theme('high-contrast', 'High Contrast', 'Bold shapes for accessibility', { primary: '#3a3a44', accent: '#141418', dark: '#000000' }),
]

const json = {
  schema: 3,
  generatedAt: new Date().toISOString(),
  templates: SVG_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    states: t.states,
    fallback: t.fallback,
    hotspot: t.hotspot,
    size: 32,
    svg: t.svg,
  })),
  themes,
}

const outPath = join(root, 'data', 'assets.json')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(json, null, 2))

// Verify every theme covers all 14 states.
let bad = 0
const known = new Set(SVG_TEMPLATES.map((t) => t.id))
for (const th of themes) {
  for (const s of ALL_STATES) {
    if (!th.states[s] || !known.has(th.states[s])) { console.error(`theme ${th.id} missing/invalid state ${s}`); bad++ }
  }
}
console.log(`wrote ${outPath} (${json.templates.length} templates, ${themes.length} themes${bad ? `, ${bad} ERRORS` : ''})`)
