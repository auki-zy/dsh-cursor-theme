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
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'

const SIZE = 32
const root = dirname(dirname(fileURLToPath(import.meta.url)))

// Load the shared pixel shape table (src/client/shapes.ts) through esbuild:
// single source of truth for built-in assets AND browser AI renderer.
const shapesOut = buildSync({
  entryPoints: [join(root, 'src', 'client', 'shapes.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  write: false,
})
// esbuild CJS emits `module.exports`; eval it inside a shimmed module scope.
const shapesModule = { exports: {} }
new Function('module', 'exports', shapesOut.outputFiles[0].text)(shapesModule, shapesModule.exports)
const { PIXEL_SHAPES, shapeToRgba } = shapesModule.exports

/** Pixelize the shared matrix (32×32 RGBA) for PNG encoding. */
function shapePixels(shape, color) {
  return shapeToRgba(shape.rows, color)
}

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

// ---------- emit: one data URL per (shape × palette) ----------

function blank() {
  return new Uint8Array(SIZE * SIZE * 4)
}
/** Palette name → [r,g,b]. Foreground-only palettes; cursors use alpha. */
const PALETTES = {
  dark: [12, 12, 14],
  light: [240, 240, 244],
  neon: [0, 229, 255],
  coral: [255, 143, 171],
  lemon: [255, 220, 80],
  mint: [80, 220, 160],
  grape: [170, 120, 255],
  sky: [90, 170, 255],
  blush: [255, 130, 190],
  peach: [255, 170, 110],
  cocoa: [140, 110, 90],
  mintDark: [40, 120, 90],
}

function dataUrlFor(shape, color) {
  const rgba = shapeToRgba(shape.rows, color)
  const png = encodePng(SIZE, SIZE, rgba)
  return `data:image/png;base64,${png.toString('base64')}`
}

// One asset per (shape, palette). Asset id: `${shape.id}-${paletteName}`.
// Asset states follow the shape's own `states` list so the built-in picker
// can offer every shape for a state.
const assets = []
for (const shape of PIXEL_SHAPES) {
  for (const [paletteName, color] of Object.entries(PALETTES)) {
    assets.push({
      id: `${shape.id}-${paletteName}`,
      name: `${shape.name} (${paletteName})`,
      states: shape.states,
      fallback: shape.fallback,
      hotspot: shape.hotspot,
      size: 32,
      image: dataUrlFor(shape, color),
    })
  }
}

// ---------- built-in themes: shape + palette combos (referenced by asset id) ----------

function assetOf(shapeId, paletteName) {
  return `${shapeId}-${paletteName}`
}

const themes = [
  {
    id: 'mono-dark',
    name: 'Mono Dark',
    description: 'Monochrome dark cursors for light UIs',
    states: {
      pointer: assetOf('arrow', 'dark'),
      text: assetOf('ibeam', 'dark'),
      wait: assetOf('ring', 'dark'),
      'not-allowed': assetOf('ban', 'dark'),
      grab: assetOf('dot', 'dark'),
      help: assetOf('question', 'dark'),
    },
  },
  {
    id: 'mono-light',
    name: 'Mono Light',
    description: 'Monochrome light cursors for dark UIs',
    states: {
      pointer: assetOf('arrow', 'light'),
      text: assetOf('ibeam', 'light'),
      wait: assetOf('ring', 'light'),
      'not-allowed': assetOf('ban', 'light'),
      grab: assetOf('dot', 'light'),
      help: assetOf('question', 'light'),
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Cyan neon cursors',
    states: {
      pointer: assetOf('arrow', 'neon'),
      text: assetOf('ibeam', 'neon'),
      wait: assetOf('ring', 'neon'),
      'not-allowed': assetOf('ban', 'neon'),
      crosshair: assetOf('crosshair', 'neon'),
      grab: assetOf('dot', 'neon'),
    },
  },
  {
    id: 'cat-coral',
    name: 'Coral Cat',
    description: 'Pink pixel cat cursors',
    states: {
      pointer: assetOf('cat', 'coral'),
      text: assetOf('ibeam', 'blush'),
      wait: assetOf('paw', 'peach'),
      'not-allowed': assetOf('ban', 'cocoa'),
      grab: assetOf('paw', 'coral'),
      help: assetOf('heart', 'blush'),
    },
  },
  {
    id: 'dog-lemon',
    name: 'Lemon Dog',
    description: 'Cheerful yellow dog cursors',
    states: {
      pointer: assetOf('dog', 'lemon'),
      text: assetOf('ibeam', 'peach'),
      wait: assetOf('star', 'lemon'),
      'not-allowed': assetOf('ban', 'cocoa'),
      grab: assetOf('paw', 'peach'),
      help: assetOf('bone', 'lemon'),
    },
  },
  {
    id: 'shark-sky',
    name: 'Sky Shark',
    description: 'Playful shark cursors',
    states: {
      pointer: assetOf('shark', 'sky'),
      text: assetOf('ibeam', 'neon'),
      wait: assetOf('bubble', 'sky'),
      'not-allowed': assetOf('ban', 'grape'),
      grab: assetOf('shark', 'sky'),
      help: assetOf('fish', 'sky'),
    },
  },
  {
    id: 'penguin-mint',
    name: 'Mint Penguin',
    description: 'Cool mint penguin cursors',
    states: {
      pointer: assetOf('penguin', 'mint'),
      text: assetOf('ibeam', 'mintDark'),
      wait: assetOf('snowflake', 'neon'),
      'not-allowed': assetOf('ban', 'grape'),
      grab: assetOf('penguin', 'mint'),
      help: assetOf('star', 'lemon'),
    },
  },
  {
    id: 'ghost-grape',
    name: 'Grape Ghost',
    description: 'Spooky purple ghost cursors',
    states: {
      pointer: assetOf('ghost', 'grape'),
      text: assetOf('ibeam', 'grape'),
      wait: assetOf('ghost', 'grape'),
      'not-allowed': assetOf('skull', 'dark'),
      grab: assetOf('dot', 'grape'),
      help: assetOf('moon', 'lemon'),
    },
  },
  {
    id: 'alien-neon',
    name: 'Alien Neon',
    description: 'Extraterrestrial neon cursors',
    states: {
      pointer: assetOf('alien', 'neon'),
      text: assetOf('ibeam', 'neon'),
      wait: assetOf('ring', 'neon'),
      'not-allowed': assetOf('ban', 'grape'),
      grab: assetOf('alien', 'neon'),
      help: assetOf('star', 'neon'),
    },
  },
  {
    id: 'whale-sky',
    name: 'Sky Whale',
    description: 'Calm whale cursors (DSH spirit)',
    states: {
      pointer: assetOf('whale', 'sky'),
      text: assetOf('ibeam', 'sky'),
      wait: assetOf('bubble', 'neon'),
      'not-allowed': assetOf('ban', 'grape'),
      grab: assetOf('whale', 'sky'),
      help: assetOf('star', 'lemon'),
    },
  },
  {
    id: 'bee-lemon',
    name: 'Lemon Bee',
    description: 'Busy-bee yellow cursors',
    states: {
      pointer: assetOf('bee', 'lemon'),
      text: assetOf('ibeam', 'cocoa'),
      wait: assetOf('bee', 'lemon'),
      'not-allowed': assetOf('ban', 'cocoa'),
      grab: assetOf('paw', 'lemon'),
      help: assetOf('flower', 'coral'),
    },
  },
  {
    id: 'heart-blush',
    name: 'Blush Hearts',
    description: 'Romantic pink heart cursors',
    states: {
      pointer: assetOf('heart', 'blush'),
      text: assetOf('ibeam', 'coral'),
      wait: assetOf('star', 'blush'),
      'not-allowed': assetOf('ban', 'cocoa'),
      grab: assetOf('heart', 'coral'),
      help: assetOf('heart', 'blush'),
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Bold shapes for accessibility',
    states: {
      pointer: assetOf('arrow', 'dark'),
      text: assetOf('ibeam', 'dark'),
      wait: assetOf('ring', 'dark'),
      'not-allowed': assetOf('ban', 'dark'),
      crosshair: assetOf('crosshair', 'dark'),
      grab: assetOf('dot', 'dark'),
      help: assetOf('question', 'dark'),
    },
  },
]

const out = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  assets,
  themes,
}

const outPath = join(root, 'data', 'assets.json')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(`wrote ${outPath} (${assets.length} assets, ${themes.length} themes)`)
