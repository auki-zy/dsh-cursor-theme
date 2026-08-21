/**
 * PNG → CUR conversion unit tests (host side).
 * Verifies the .cur file layout: ICONDIR header (type=2 cursor), one entry
 * with hotspot, PNG payload, and hotspot clamping.
 */
import { describe, expect, it } from 'vitest'
import { pngDataUrlToCur } from '../src/cur.js'

// A minimal valid 1×1 PNG data URL.
const PNG_1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

// 32×32 PNG (opaque), generated inline: we just need IHDR dimensions = 32.
function png32(): string {
  // Build a real 32×32 RGBA PNG using zlib (deflate) — hand-rolled minimal.
  // Use a precomputed valid 32×32 PNG instead (1x1 scaled isn't 32).
  // Simpler: use Node to build it at test time via zlib.
  const zlib = require('node:zlib') as typeof import('node:zlib')
  const crc32 = (buf: Buffer): number => {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i]
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    }
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type: string, data: Buffer): Buffer => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const t = Buffer.from(type, 'ascii')
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
    return Buffer.concat([len, t, data, crc])
  }
  const size = 32
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0
    for (let x = 0; x < size; x++) {
      const i = y * (1 + size * 4) + 1 + x * 4
      raw[i] = 200; raw[i + 1] = 100; raw[i + 2] = 50; raw[i + 3] = 255
    }
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
  return `data:image/png;base64,${png.toString('base64')}`
}

describe('pngDataUrlToCur', () => {
  it('produces a valid CUR header (type=2, one entry)', () => {
    const cur = pngDataUrlToCur(PNG_1x1, 0, 0)
    expect(cur.readUInt16LE(0)).toBe(0)      // reserved
    expect(cur.readUInt16LE(2)).toBe(2)      // cursor
    expect(cur.readUInt16LE(4)).toBe(1)      // count
    expect(cur.readUInt32LE(18)).toBe(22)    // offset
  })

  it('stores the hotspot in the entry header', () => {
    const cur = pngDataUrlToCur(png32(), 3, 7)
    expect(cur.readUInt16LE(10)).toBe(3)
    expect(cur.readUInt16LE(12)).toBe(7)
  })

  it('clamps out-of-range hotspots into the image bounds', () => {
    const cur = pngDataUrlToCur(png32(), 999, -5)
    expect(cur.readUInt16LE(10)).toBe(31)   // clamped to width-1
    expect(cur.readUInt16LE(12)).toBe(0)
  })

  it('writes a 32×32 image with correct entry dims and payload', () => {
    const cur = pngDataUrlToCur(png32(), 16, 16)
    expect(cur.readUInt8(6)).toBe(32)        // width
    expect(cur.readUInt8(7)).toBe(32)        // height
    const size = cur.readUInt32LE(14)
    expect(size).toBe(cur.length - 22)       // payload = PNG bytes
    expect(cur.subarray(22).toString('utf8', 1, 4)).toBe('PNG')
  })

  it('rejects non-PNG data URLs', () => {
    expect(() => pngDataUrlToCur('data:image/jpeg;base64,AAAA', 0, 0)).toThrow(/PNG/)
  })
})
