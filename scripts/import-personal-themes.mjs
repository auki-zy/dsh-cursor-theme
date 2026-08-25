/**
 * Import personal themes from assets/personal/<dir>/ into the built-in set.
 *
 * Each personal theme directory contains 14 state PNGs + manifest.json
 * (the ZIP image-pack format). This script converts them into schema-1 pack
 * JSON (data/themes-<slug>.json) with baked PNG data URLs; generate-assets.mjs
 * then merges them into data/assets.json as built-in preset themes.
 *
 * Workflow (per README "Personal Theme"):
 *   1. fork this repo
 *   2. put your pack under assets/personal/<your-name>/ (PNGs + manifest.json)
 *   3. node scripts/import-personal-themes.mjs
 *   4. node scripts/generate-assets.mjs
 *   5. apply in Settings → Cursor Theme
 *
 * Usage: node scripts/import-personal-themes.mjs
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const PERSONAL_DIR = join(root, 'assets', 'personal')
const OUT_DIR = join(root, 'data')

function dataUrl(bytes) {
  return `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`
}

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'personal'
}

if (!existsSync(PERSONAL_DIR)) {
  console.log('no assets/personal/ dir, nothing to import')
  process.exit(0)
}

let imported = 0
for (const dir of readdirSync(PERSONAL_DIR)) {
  const dirPath = join(PERSONAL_DIR, dir)
  const manifestPath = join(dirPath, 'manifest.json')
  if (!existsSync(manifestPath)) continue

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest?.schema !== 1 || typeof manifest?.name !== 'string' || typeof manifest?.states !== 'object') {
    console.log(`skip ${dir}: invalid manifest`)
    continue
  }

  const states = {}
  for (const [stateId, meta] of Object.entries(manifest.states)) {
    if (typeof meta !== 'object' || meta === null || !meta.file) continue
    const pngPath = join(dirPath, meta.file)
    if (!existsSync(pngPath)) {
      console.log(`  missing ${meta.file} for ${stateId}, skipping state`)
      continue
    }
    states[stateId] = {
      image: dataUrl(readFileSync(pngPath)),
      ...meta.hotspot ? { hotspot: meta.hotspot } : {},
      ...meta.size ? { size: meta.size } : {},
    }
  }
  if (Object.keys(states).length === 0) {
    console.log(`skip ${dir}: no usable states`)
    continue
  }

  const id = slugify(manifest.name)
  const pack = {
    schema: 1,
    id,
    name: manifest.name,
    description: `Personal theme (${dir})`,
    source: 'personal',
    states,
  }
  writeFileSync(join(OUT_DIR, `themes-${id}.json`), JSON.stringify(pack, null, 2))
  console.log(`imported ${dir} → themes-${id}.json (${Object.keys(states).length} states)`)
  imported++
}

console.log(`\n${imported} personal theme(s) imported. Run generate-assets.mjs to merge.`)
