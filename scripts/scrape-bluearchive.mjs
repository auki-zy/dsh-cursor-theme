/**
 * dsh-cursor-theme scraper: pull a popular open-source cursor theme
 * (MIT-licensed) and bake it in as a preset.
 *
 * Source: makipom/BlueArchive-Cursors (MIT) — 32×32 BMP cursors.
 *   https://github.com/makipom/BlueArchive-Cursors
 *
 * Maps as many DSH states as the theme ships to real cursor files:
 *   default→normal, pointer→link, text→pen, wait→areaselect,
 *   help→help, not-allowed→block, grab→move, move→move,
 *   resize-ew→resizeWE, resize-ns→resizeNS, resize-ne-sw→resizeDIAG1,
 *   resize-nw-se→resizeDIAG2, copy→alternativeselect, cell→alternativeselect
 *
 * Output: data/themes-bluearchive.json (PNG data URLs + hotspots) and
 * data/licenses/bluearchive.txt (MIT attribution — required).
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

/**
 * DSH state → file mapping per theme variant. Each variant maps to .cur
 * files in the repo (root or "Millennium Edition" dir, prefixed accordingly).
 * text/wait are .ani in the root — the mini set / millennium set provide
 * static pen/areaselect.
 */
const VARIANTS = {
  bluearchive: {
    id: 'bluearchive',
    name: 'BlueArchive',
    description: 'BlueArchive 二次元光标主题（GitHub makipom/BlueArchive-Cursors，MIT 许可）',
    attribution: 'BlueArchive-Cursors © 2023 Maki (MIT) — github.com/makipom/BlueArchive-Cursors',
    dir: '',
    prefix: '',
    states: {
      default: 'normal', pointer: 'link', text: 'pen', wait: 'areaselect',
      help: 'help', 'not-allowed': 'block', grab: 'move', grabbing: 'move',
      progress: 'areaselect', move: 'move', 'resize-ew': 'resizeWE',
      'resize-ns': 'resizeNS', copy: 'alternativeselect', cell: 'alternativeselect',
    },
  },
  'bluearchive-millennium': {
    id: 'bluearchive-millennium',
    name: 'BlueArchive Millennium',
    description: 'BlueArchive 千禧学院版光标主题（同仓库，MIT 许可）',
    attribution: 'BlueArchive-Cursors © 2023 Maki (MIT) — github.com/makipom/BlueArchive-Cursors',
    dir: 'Millennium Edition/',
    prefix: 'millennium_',
    states: {
      default: 'base', pointer: 'link', text: 'pen', wait: 'areaselect',
      help: 'help_rio', 'not-allowed': 'block', grab: 'move', grabbing: 'move',
      progress: 'areaselect', move: 'move', 'resize-ew': 'EW',
      'resize-ns': 'NS', copy: 'alternative', cell: 'alternative',
    },
  },
}

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

/** DSH state → CSS fallback keyword. */
const FALLBACKS = {
  default: 'default', pointer: 'pointer', text: 'text', wait: 'wait', help: 'help',
  'not-allowed': 'not-allowed', grab: 'grab', grabbing: 'grabbing', progress: 'progress',
  move: 'move', 'resize-ew': 'ew-resize', 'resize-ns': 'ns-resize',
  copy: 'copy', cell: 'cell',
}

async function main() {
  mkdirSync(join(root, 'data', 'licenses'), { recursive: true })
  // Fetch MIT license once for attribution.
  try {
    const lic = await download(`${BASE}/LICENSE`)
    writeFileSync(join(root, 'data', 'licenses', 'bluearchive.txt'), lic)
  } catch {
    writeFileSync(join(root, 'data', 'licenses', 'bluearchive.txt'),
      'MIT License\nCopyright (c) 2023 Maki\nSee https://github.com/makipom/BlueArchive-Cursors\n')
  }

  for (const variant of Object.values(VARIANTS)) {
    const out = {
      schema: 1,
      id: variant.id,
      name: variant.name,
      description: variant.description,
      source: `https://github.com/${REPO}`,
      license: 'MIT',
      attribution: variant.attribution,
      states: {},
    }
    for (const [stateId, fileName] of Object.entries(variant.states)) {
      const url = `${BASE}/${variant.dir}${variant.prefix}${fileName}.cur`
      try {
        const cur = await download(url)
        const dec = curBmpToRgba(cur)
        if (!dec) { console.error(`skip ${variant.id}/${stateId}: not a 32bpp BMP cursor`); continue }
        const png = rgbaToPng(dec.width, dec.height, dec.rgba)
        out.states[stateId] = {
          image: `data:image/png;base64,${png.toString('base64')}`,
          hotspot: { x: cur.readUInt16LE(10), y: cur.readUInt16LE(12) },
          fallback: FALLBACKS[stateId] ?? 'default',
          size: 32,
        }
        console.log(`ok ${variant.id}/${stateId}`)
      } catch (e) {
        console.error(`skip ${variant.id}/${stateId}: ${e.message}`)
      }
    }
    writeFileSync(join(root, 'data', `themes-${variant.id}.json`), JSON.stringify(out, null, 2))
    console.log(`wrote data/themes-${variant.id}.json (${Object.keys(out.states).length} states)`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
