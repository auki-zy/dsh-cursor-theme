/**
 * dsh-cursor-theme asset generator (M3a).
 *
 * Generates a small built-in cursor asset library as PNG data URLs and
 * writes data/assets.json. Pure Node (zlib + hand-rolled PNG chunks), no
 * image dependencies — keeps the repo dependency-light and reproducible.
 *
 * Shapes drawn on a 32×32 RGBA grid:
 *   pointer      classic arrow
 *   text         I-beam
 *   wait         ring (busy)
 *   not-allowed  circle + diagonal slash
 *   crosshair    crosshair
 *   grab         filled dot (drag handle)
 *   help         question mark
 * Each shape is emitted in 3 palettes: dark, light, neon.
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZE = 32
const root = dirname(dirname(fileURLToPath(import.meta.url)))

// ---------- PNG encoding ----------

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  // scanlines with filter byte 0
  const raw = Buffer.alloc(height * (1 + width * 4))
  const rgbaBuf = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength)
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0
    rgbaBuf.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw)
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- shape rasterization (32×32 RGBA grid) ----------

function blank() {
  return new Uint8Array(SIZE * SIZE * 4)
}

function setPx(px, x, y, color) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  px[i] = color[0]; px[i + 1] = color[1]; px[i + 2] = color[2]; px[i + 3] = color[3]
}

function fillRect(px, x0, y0, x1, y1, color) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setPx(px, x, y, color)
}

function fillCircle(px, cx, cy, r, color) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx; const dy = y - cy
      if (dx * dx + dy * dy <= r * r) setPx(px, x, y, color)
    }
  }
}

function fillPoly(px, pts, color) {
  // scanline fill for small convex-ish polygons
  const minX = Math.max(0, Math.min(...pts.map((p) => p[0])))
  const maxX = Math.min(SIZE - 1, Math.max(...pts.map((p) => p[0])))
  const minY = Math.max(0, Math.min(...pts.map((p) => p[1])))
  const maxY = Math.min(SIZE - 1, Math.max(...pts.map((p) => p[1])))
  for (let y = minY; y <= maxY; y++) {
    const xs = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]; const b = pts[(i + 1) % pts.length]
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        const t = (y - a[1]) / (b[1] - a[1])
        xs.push(a[0] + t * (b[0] - a[0]))
      }
    }
    xs.sort((a, b) => a - b)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) setPx(px, x, y, color)
    }
  }
}

// ---------- shapes ----------

function arrow(color) {
  const px = blank()
  fillPoly(px, [[2, 2], [12, 14], [9, 14], [13, 21], [11, 22], [7, 15], [4, 18], [2, 15]], color)
  return px
}

function ibeam(color) {
  const px = blank()
  fillRect(px, 10, 2, 21, 4, color)
  fillRect(px, 10, 27, 21, 29, color)
  fillRect(px, 14, 4, 17, 27, color)
  return px
}

function ring(color) {
  const px = blank()
  fillCircle(px, 16, 16, 12, color)
  // punch inner hole with transparent
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const dx = x - 16; const dy = y - 16
    if (dx * dx + dy * dy <= 5 * 5) {
      const i = (y * SIZE + x) * 4
      px[i + 3] = 0
    }
  }
  return px
}

function notAllowed(color) {
  const px = blank()
  fillCircle(px, 16, 16, 12, color)
  // diagonal slash
  fillPoly(px, [[5, 22], [8, 25], [25, 8], [22, 5]], color)
  return px
}

function crosshair(color) {
  const px = blank()
  fillRect(px, 15, 1, 16, 9, color)
  fillRect(px, 15, 22, 16, 30, color)
  fillRect(px, 1, 15, 9, 16, color)
  fillRect(px, 22, 15, 30, 16, color)
  fillCircle(px, 16, 16, 2, color)
  return px
}

function dot(color) {
  const px = blank()
  fillCircle(px, 16, 16, 9, color)
  return px
}

function question(color) {
  const px = blank()
  // simplified question mark from rects
  fillRect(px, 10, 5, 21, 7, color)
  fillRect(px, 21, 7, 23, 12, color)
  fillRect(px, 18, 11, 22, 14, color)
  fillRect(px, 14, 14, 18, 20, color)
  fillRect(px, 14, 24, 18, 26, color)
  return px
}

// ---------- palettes ----------

const PALETTES = {
  dark: [12, 12, 14, 255],      // near-black, for light UIs
  light: [240, 240, 244, 255],  // near-white, for dark UIs
  neon: [0, 229, 255, 255],     // cyan accent
}

const SHAPES = {
  pointer: { draw: arrow, fallback: 'pointer', hotspot: { x: 2, y: 2 } },
  text: { draw: ibeam, fallback: 'text', hotspot: { x: 16, y: 16 } },
  wait: { draw: ring, fallback: 'wait', hotspot: { x: 16, y: 16 } },
  'not-allowed': { draw: notAllowed, fallback: 'not-allowed', hotspot: { x: 16, y: 16 } },
  crosshair: { draw: crosshair, fallback: 'crosshair', hotspot: { x: 16, y: 16 } },
  grab: { draw: dot, fallback: 'grab', hotspot: { x: 16, y: 16 } },
  help: { draw: question, fallback: 'help', hotspot: { x: 16, y: 16 } },
}

// ---------- emit ----------

function dataUrl(name, paletteName, color) {
  const px = SHAPES[name].draw(color)
  const png = encodePng(SIZE, SIZE, px)
  return `data:image/png;base64,${png.toString('base64')}`
}

const assets = []
for (const [shapeName, shape] of Object.entries(SHAPES)) {
  for (const [paletteName, color] of Object.entries(PALETTES)) {
    const id = `${shapeName}-${paletteName}`
    assets.push({
      id,
      name: `${shapeName} (${paletteName})`,
      states: [shapeName],
      fallback: shape.fallback,
      hotspot: shape.hotspot,
      size: 32,
      image: dataUrl(shapeName, paletteName, color),
    })
  }
}

const out = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  assets,
  themes: [
    {
      id: 'mono-dark',
      name: 'Mono Dark',
      description: 'Monochrome dark cursors for light UIs',
      states: {
        pointer: 'pointer-dark',
        text: 'text-dark',
        wait: 'wait-dark',
        'not-allowed': 'not-allowed-dark',
        grab: 'grab-dark',
        help: 'help-dark',
      },
    },
    {
      id: 'mono-light',
      name: 'Mono Light',
      description: 'Monochrome light cursors for dark UIs',
      states: {
        pointer: 'pointer-light',
        text: 'text-light',
        wait: 'wait-light',
        'not-allowed': 'not-allowed-light',
        grab: 'grab-light',
        help: 'help-light',
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'Cyan neon cursors',
      states: {
        pointer: 'pointer-neon',
        text: 'text-neon',
        wait: 'wait-neon',
        'not-allowed': 'not-allowed-neon',
        crosshair: 'crosshair-neon',
        grab: 'grab-neon',
      },
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Bold shapes for accessibility',
      states: {
        pointer: 'pointer-dark',
        text: 'text-dark',
        wait: 'wait-dark',
        'not-allowed': 'not-allowed-dark',
        crosshair: 'crosshair-dark',
        grab: 'grab-dark',
        help: 'help-dark',
      },
    },
  ],
}

const outPath = join(root, 'data', 'assets.json')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(`wrote ${outPath} (${assets.length} assets, ${out.themes.length} themes)`)
