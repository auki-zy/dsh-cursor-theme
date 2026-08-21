/**
 * dsh-cursor-theme scraper: pull a popular open-source cursor theme
 * (MIT-licensed) and bake it in as a preset.
 *
 * Source: makipom/BlueArchive-Cursors (MIT) — 32×32 BMP cursors.
 *   https://github.com/makipom/BlueArchive-Cursors
 *
 * The scraper:
 *   1. downloads the .cur files for the core states from raw.githubusercontent;
 *   2. decodes each (cur-bmp.ts) into a 32×32 RGBA buffer;
 *   3. encodes PNG data URLs;
 *   4. writes data/themes-bluearchive.json + data/licenses/bluearchive.txt
 *      (license attribution — required by MIT).
 *
 * Run: node scripts/scrape-bluearchive.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const REPO = 'makipom/BlueArchive-Cursors'
const BRANCH = 'main'
const BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`

/** Windows cursor state → BlueArchive file (without extension). */
const STATE_FILES = {
  default: 'normal',
  pointer: 'link',
  text: 'pen',
  wait: 'areaselect',
  help: 'help',
  'not-allowed': 'block',
  grab: 'move',
  'resize-ew': 'resizeWE',
  'resize-ns': 'resizeNS',
}

// ---- BMP → PNG (shared with src/cur-bmp.ts logic) ----
import { curBmpToRgba } from '../src/cur-bmp.ts'

const crc32 = (buf) => {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}
function rgbaToPng(w, h, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6
  const raw = Buffer.alloc(h * (1 + w * 4))
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (1 + w * 4) + 1)
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const out = { schema: 1, name: 'BlueArchive', source: `https://github.com/${REPO}`, license: 'MIT', states: {} }
  const fallbacks = {
    default: 'default', pointer: 'pointer', text: 'text', wait: 'wait', help: 'help',
    'not-allowed': 'not-allowed', grab: 'grab', 'resize-ew': 'ew-resize', 'resize-ns': 'ns-resize',
  }
  for (const [stateId, fileName] of Object.entries(STATE_FILES)) {
    // text/wait are only shipped as .ani in the root; use the mini .cur set
    // which has static cursors for pen/areaselect.
    const base = stateId === 'text' || stateId === 'wait' ? 'Blue Archive mini' : ''
    const url = `${BASE}/${base ? base + '/' : ''}${fileName}${base ? '-mini' : ''}.cur`
    try {
      const cur = await download(url)
      const dec = curBmpToRgba(cur)
      if (!dec) { console.error(`skip ${stateId}: not a 32bpp BMP cursor`); continue }
      const png = rgbaToPng(dec.width, dec.height, dec.rgba)
      out.states[stateId] = {
        image: `data:image/png;base64,${png.toString('base64')}`,
        hotspot: { x: 0, y: 0 }, // hotspot read from cur below
        fallback: fallbacks[stateId],
        size: 32,
      }
      // hotspot from the CUR entry header (bytes 10..13)
      out.states[stateId].hotspot = { x: cur.readUInt16LE(10), y: cur.readUInt16LE(12) }
      console.log(`ok ${stateId} (${png.length} bytes) hotspot=${cur.readUInt16LE(10)},${cur.readUInt16LE(12)}`)
    } catch (e) {
      console.error(`skip ${stateId}: ${e.message}`)
    }
  }

  mkdirSync(join(root, 'data', 'licenses'), { recursive: true })
  // Fetch the MIT license text for attribution.
  try {
    const lic = await download(`${BASE}/LICENSE`)
    writeFileSync(join(root, 'data', 'licenses', 'bluearchive.txt'), lic)
  } catch {
    writeFileSync(join(root, 'data', 'licenses', 'bluearchive.txt'),
      'MIT License\nCopyright (c) 2023 Maki\nSee https://github.com/makipom/BlueArchive-Cursors\n')
  }
  writeFileSync(join(root, 'data', 'themes-bluearchive.json'), JSON.stringify(out, null, 2))
  console.log(`wrote data/themes-bluearchive.json (${Object.keys(out.states).length} states)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
