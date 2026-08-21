/**
 * dsh-cursor-theme browser renderers (M4 / M4.5).
 *
 *  - Pixel-shape renderer (legacy M4): 16×16 matrix + color → 32×32 PNG.
 *  - SVG renderer (M4.5): full SVG art → PNG data URL via canvas + Image,
 *    so preset AND AI-generated themes are real graphics, not pixel blocks.
 */

import { shapeToRgba, type PixelShape } from './shapes.js'

const SIZE = 32

/** Parse '#rrggbb' (or '#rgb') into an RGB tuple; throws on invalid. */
export function parseHexColor(hex: string): [number, number, number] {
  let h = hex.trim()
  if (h.startsWith('#')) h = h.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid color "${hex}" — use #rrggbb`)
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/**
 * Render a shape + color into a 32×32 PNG data URL (legacy pixel shapes).
 * @returns a `data:image/png;base64,...` URL, or null when canvas is absent.
 */
export function renderShapeToDataUrl(shape: PixelShape, color: string): string | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const rgb = parseHexColor(color)
  const rgba = shapeToRgba(shape.rows, rgb)
  const imageData = ctx.createImageData(SIZE, SIZE)
  imageData.data.set(rgba)
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * Render a full SVG string into a 32×32 PNG data URL.
 *
 * The SVG is loaded as an image (data URL) and drawn onto a canvas at 2×
 * then downscaled — smooth anti-aliased output for high-quality art.
 * @param svg - standalone SVG markup (any size; drawn into 32×32).
 * @param size - output square size in px (default 32).
 * @returns a Promise resolving to `data:image/png;base64,...`, or null when
 *   canvas/Image is unavailable.
 */
export function renderSvgToDataUrl(svg: string, size = SIZE): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null)
      return
    }
    const canvas = document.createElement('canvas')
    // Render at 2× then draw down to `size` for crisp edges.
    const hi = size * 2
    canvas.width = hi
    canvas.height = hi
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    const img = new Image()
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, hi, hi)
        const out = document.createElement('canvas')
        out.width = size
        out.height = size
        const octx = out.getContext('2d')
        if (!octx) {
          resolve(null)
          return
        }
        octx.drawImage(canvas, 0, 0, size, size)
        resolve(out.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = encoded
  })
}

