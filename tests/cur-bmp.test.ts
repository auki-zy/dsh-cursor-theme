/**
 * CUR BMP decoder unit tests (host side). Builds a synthetic 32bpp BMP
 * cursor (2×N with AND mask, bottom-up) and verifies upright RGBA output.
 */
import { describe, expect, it } from 'vitest'
import { curBmpToRgba } from '../src/cur-bmp.js'

/** Build a .cur containing a 2×N 32bpp bottom-up BMP cursor. */
function makeCur(size: number): Buffer {
  // ICONDIR + entry
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(2, 2)       // cursor
  header.writeUInt16LE(1, 4)       // count
  header.writeUInt8(size, 6)
  header.writeUInt8(size, 7)
  header.writeUInt16LE(3, 10)      // hotspot x
  header.writeUInt16LE(4, 12)      // hotspot y
  // BMP payload: BITMAPINFOHEADER(40) + BGRA rows for 2N rows
  const bmpSize = 40 + size * (size * 2) * 4
  header.writeUInt32LE(bmpSize, 14)
  header.writeUInt32LE(22, 18)

  const bmp = Buffer.alloc(bmpSize)
  bmp.writeUInt32LE(40, 0)         // header size
  bmp.writeInt32LE(size, 4)        // width
  bmp.writeInt32LE(size * 2, 8)    // height (2N)
  bmp.writeUInt16LE(1, 12)         // planes
  bmp.writeUInt16LE(32, 14)        // bpp
  bmp.writeUInt32LE(0, 16)         // BI_RGB

  // Fill the VISIBLE half (rows 0..size-1 of file data = BOTTOM half of the
  // 2N canvas, which is the top half of the final image after flip).
  // Paint each pixel with a distinct color so we can verify orientation.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const off = 40 + (y * size + x) * 4
      bmp[off] = x          // B
      bmp[off + 1] = y      // G
      bmp[off + 2] = 255    // R
      bmp[off + 3] = 255    // A
    }
  }
  return Buffer.concat([header, bmp])
}

describe('curBmpToRgba', () => {
  it('decodes a 2N BMP cursor into an upright N×N RGBA image', () => {
    const cur = makeCur(32)
    const img = curBmpToRgba(cur)
    expect(img).not.toBeNull()
    expect(img!.width).toBe(32)
    expect(img!.height).toBe(32) // mask half stripped
    expect(img!.rgba.length).toBe(32 * 32 * 4)
  })

  it('flips bottom-up rows to upright orientation', () => {
    const cur = makeCur(4)
    const img = curBmpToRgba(cur)!
    // Decoder emits R,G,B,A per pixel. Output row 0 ← file row 3 (G=3),
    // output row 3 ← file row 0 (G=0). R is constant 255.
    const topLeft = (0 * 4 + 0) * 4
    expect(img.rgba[topLeft]).toBe(255)      // R
    expect(img.rgba[topLeft + 1]).toBe(3)    // G of output (0,0) = file row 3
    const bottomLeft = (3 * 4 + 0) * 4
    expect(img.rgba[bottomLeft + 1]).toBe(0) // G of output (3,0) = file row 0
    // Horizontal order preserved: output (0,3) B channel = 3
    const topRight = (0 * 4 + 3) * 4
    expect(img.rgba[topRight + 2]).toBe(3)   // B
  })

  it('rejects non-cursor files', () => {
    const bad = Buffer.alloc(22)
    bad.writeUInt16LE(1, 2) // type = icon, not cursor
    expect(curBmpToRgba(bad)).toBeNull()
  })
})
