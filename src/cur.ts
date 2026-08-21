/**
 * dsh-cursor-theme host: PNG → CUR conversion (pure Node, no deps).
 *
 * CUR is ICO-family: an ICONDIR header + one ICONDIRENTRY + the image bytes.
 * Modern Windows supports PNG-compressed images inside CUR (Vista+), with the
 * hotspot stored in the entry header. We write PNG-compressed CUR, so any
 * PNG data URL the client sends becomes a valid system cursor file.
 *
 * Layout:
 *   ICONDIR (6 bytes): reserved=0, type=2 (cursor), count=1
 *   ICONDIRENTRY (16 bytes): width, height, colors=0, reserved=0,
 *     xHotspot, yHotspot, size, offset=22
 *   Image bytes (PNG) at offset 22
 */

/** Convert a PNG data URL (32-bit or smaller) into a .cur file's bytes. */
export function pngDataUrlToCur(dataUrl: string, hotspotX: number, hotspotY: number): Buffer {
  const comma = dataUrl.indexOf(',')
  if (!dataUrl.startsWith('data:image/png') || comma < 0) {
    throw new Error('System cursors require a PNG data URL')
  }
  const b64 = dataUrl.slice(comma + 1)
  const png = Buffer.from(b64, 'base64')

  // Read dimensions from IHDR (bytes 16..23 of a PNG).
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  if (width === 0 || height === 0 || width > 128 || height > 128) {
    throw new Error(`System cursor image must be 1–128 px (got ${width}×${height})`)
  }

  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)      // reserved
  header.writeUInt16LE(2, 2)      // type: cursor
  header.writeUInt16LE(1, 4)      // count
  // ICONDIRENTRY
  header.writeUInt8(width === 256 ? 0 : width, 6)
  header.writeUInt8(height === 256 ? 0 : height, 7)
  header.writeUInt8(0, 8)         // palette
  header.writeUInt8(0, 9)         // reserved
  header.writeUInt16LE(clampHotspot(hotspotX, width), 10)
  header.writeUInt16LE(clampHotspot(hotspotY, height), 12)
  header.writeUInt32LE(png.length, 14)  // size
  header.writeUInt32LE(22, 18)          // offset

  return Buffer.concat([header, png])
}

/** Clamp a hotspot into the image bounds (CUR requires in-range values). */
function clampHotspot(v: number, limit: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(Math.round(v), limit - 1))
}
