/**
 * dsh-cursor-theme host: decode Windows .cur files that embed 32-bit BMP
 * images into a 32×32 RGBA buffer (pure Node).
 *
 * CUR = ICONDIR header + entry + image bytes. Cursor BMPs are often stored
 * as height = 2×N (N pixels of image + N pixels of AND mask) in bottom-up
 * order. This decoder:
 *   - reads the BMP (32bpp BGRA, BI_RGB);
 *   - splits the 2×N canvas, keeps the image half, flips it upright;
 *   - returns an N×N RGBA buffer ready for PNG encoding.
 *
 * If the BMP is already N×N (no mask), it is used directly.
 */

export interface CurImage {
  width: number
  height: number
  rgba: Buffer
}

/** Parse the BMP payload inside a .cur and return an upright RGBA image. */
export function curBmpToRgba(curBytes: Buffer): CurImage | null {
  if (curBytes.readUInt16LE(2) !== 2) return null // type must be cursor
  const offset = curBytes.readUInt32LE(18)
  const bmp = curBytes.subarray(offset)

  const headerSize = bmp.readUInt32LE(0)
  if (headerSize !== 40) return null // BITMAPINFOHEADER only
  let width = bmp.readInt32LE(4)
  let height = bmp.readInt32LE(8)
  if (bmp.readUInt16LE(12) !== 1 || bmp.readUInt16LE(14) !== 32 || bmp.readUInt32LE(16) !== 0) return null
  const topDown = height < 0
  if (topDown) height = -height

  const dataOffset = 40
  const rowStride = width * 4
  // If height is even and > width, the lower half is the AND mask: the
  // visible image occupies `height/2` rows. Otherwise use all rows.
  const visibleHeight = (height % 2 === 0 && height > width) ? height / 2 : height

  const rgba = Buffer.alloc(width * visibleHeight * 4)
  for (let y = 0; y < visibleHeight; y++) {
    // BMP bottom-up: row 0 of file data is the BOTTOM of the image.
    const fileRow = topDown ? y : (visibleHeight - 1 - y)
    const srcRow = dataOffset + fileRow * rowStride
    for (let x = 0; x < width; x++) {
      const si = srcRow + x * 4
      const di = (y * width + x) * 4
      rgba[di] = bmp[si + 2] ?? 0       // R
      rgba[di + 1] = bmp[si + 1] ?? 0   // G
      rgba[di + 2] = bmp[si] ?? 0       // B
      rgba[di + 3] = bmp[si + 3] ?? 0   // A
    }
  }
  return { width, height: visibleHeight, rgba }
}
