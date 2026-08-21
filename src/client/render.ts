/**
 * dsh-cursor-theme browser shape renderer (M4).
 *
 * Renders a PixelShape matrix + hex color into a 32×32 PNG data URL using
 * canvas — no server round-trip, so AI-generated themes (shape + color)
 * become ready-to-use cursor assets instantly. Mirrors the Node generator's
 * output (scripts/generate-assets.mjs) so built-in and generated assets are
 * pixel-identical in style.
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
 * Render a shape + color into a 32×32 PNG data URL.
 * @param shape - the pixel shape.
 * @param color - '#rrggbb' foreground color.
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
