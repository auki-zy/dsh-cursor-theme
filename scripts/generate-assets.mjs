/**
 * dsh-cursor-theme asset generator.
 *
 * Emits SVG shape templates (src/client/svg-assets.ts) into data/assets.json
 * and merges theme packs (data/themes-*.json) as preset themes. Packs are
 * produced by scripts/generate-theme-packs.mjs (ORIGINAL themes — no third
 * party license needed) and optionally by scrapers. PNGs for template picker
 * entries are rendered at runtime by the browser (canvas, render.ts).
 *
 * data/assets.json shape:
 *   { schema, generatedAt, templates: [...], themes: [{ id, name,
 *     description, prebuilt: { <stateId>: <config> }, source? }] }
 */

import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
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
  // Preset themes come from generated packs (scripts/generate-theme-packs.mjs
  // → data/themes-*.json, schema 1, source: 'original'). The template library
  // stays for the per-state built-in picker. themes are merged below.
  themes: [],
}

// Merge theme packs (data/themes-*.json) into assets.json.
const scraped = []
for (const file of readdirSync(join(root, 'data')).filter((f) => /^themes-.*\.json$/.test(f))) {
  const pack = JSON.parse(readFileSync(join(root, 'data', file), 'utf8'))
  if (pack?.schema === 1 && typeof pack?.name === 'string' && typeof pack?.states === 'object') {
    scraped.push({
      id: pack.id ?? pack.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: pack.name,
      description: pack.description ?? `Generated theme (${pack.source ?? 'original'})`,
      prebuilt: pack.states,
      source: pack.source,
    })
  }
}
json.themes.push(...scraped)

const outPath = join(root, 'data', 'assets.json')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(json, null, 2))

console.log(`wrote ${outPath} (${json.templates.length} templates, ${json.themes.length} preset themes)`)
