/**
 * dsh-cursor-theme image-pack import/export (zip).
 *
 * A theme pack is a ZIP containing one PNG per configured state plus a
 * manifest.json: { schema, name, version, enabled, defaultSize, states:
 * { <stateId>: { file: "pointer.png", hotspot: {x,y}, size } } }.
 *
 * - Export writes real image files (not base64 inside JSON) — easy to
 *   inspect, edit, and share.
 * - Import reads the zip, validates every entry, and produces a `states`
 *   fragment with data URLs. Fail-closed: nothing is applied on error.
 */

import JSZip from 'jszip'
import type { CursorStateConfig, CursorThemeSettings } from './types.js'

export interface ImagePackManifest {
  schema: number
  name: string
  version: string
  enabled?: boolean
  defaultSize?: number
  states: Record<string, { file: string; hotspot?: { x: number; y: number }; size?: number }>
}

export const IMAGE_PACK_SCHEMA = 1

/**
 * Per-image byte cap inside a pack. This is a HUMAN limit, not a browser
 * one: state images are stored as data URLs inside the persisted settings
 * and rendered into the settings page, so an unbounded cap would bloat
 * writes and freeze the UI. 5 MB is far beyond any real cursor PNG (a
 * 128×128 image is typically < 100 KB) while still rejecting absurd packs.
 *
 * Note: the PIXEL cap that applies to every state image is a browser hard
 * limit on `cursor: url(...)` (Chromium/WebKit/Firefox all ignore larger
 * images), so oversized pack images are auto-scaled down to it (see
 * resizeMetrics / resizePngBytes below).
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Browser hard cap for `cursor: url(...)` images. Images above it are ignored. */
export const MAX_CURSOR_PIXEL = 128
const MAX_STATES = 32

export interface ResizeMetrics {
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
}

/**
 * Contain-scale metrics to fit a `width × height` image into a
 * MAX_CURSOR_PIXEL canvas, centered. Also used to remap hotspots after the
 * resize (hotspot' = round(hotspot * scale) + offset).
 */
export function resizeMetrics(width: number, height: number, max: number = MAX_CURSOR_PIXEL): ResizeMetrics {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
  }
  const scale = max / Math.max(width, height)
  if (scale >= 1) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
  const dw = Math.round(width * scale)
  const dh = Math.round(height * scale)
  return {
    scaleX: scale,
    scaleY: scale,
    offsetX: Math.round((max - dw) / 2),
    offsetY: Math.round((max - dh) / 2),
  }
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** Read PNG width/height from the IHDR chunk (bytes 16-23, big endian), or null. */
function pngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return null
  }
  const width = bytes[16] * 0x1000000 + bytes[17] * 0x10000 + bytes[18] * 0x100 + bytes[19]
  const height = bytes[20] * 0x1000000 + bytes[21] * 0x10000 + bytes[22] * 0x100 + bytes[23]
  if (width <= 0 || height <= 0 || width > 16384 || height > 16384) return null
  return { width, height }
}

/**
 * Re-encode a PNG scaled into a MAX_CURSOR_PIXEL canvas (contain + centered).
 * Returns null when the browser API is unavailable or decoding fails — the
 * caller then keeps the original bytes (also the node/test-code path).
 */
async function resizePngBytes(bytes: Uint8Array, metrics: ResizeMetrics): Promise<Uint8Array | null> {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return null
  try {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }))
    try {
      const canvas = document.createElement('canvas')
      canvas.width = MAX_CURSOR_PIXEL
      canvas.height = MAX_CURSOR_PIXEL
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(
        bitmap,
        metrics.offsetX, metrics.offsetY,
        Math.round(bitmap.width * metrics.scaleX),
        Math.round(bitmap.height * metrics.scaleY),
      )
      const dataUrl = canvas.toDataURL('image/png')
      const comma = dataUrl.indexOf(',')
      if (comma < 0) return null
      const bin = atob(dataUrl.slice(comma + 1))
      const out = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
      return out
    } finally {
      bitmap.close?.()
    }
  } catch {
    return null
  }
}

/** Extract the base64 payload of a data URL, or throw. */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(',')
  if (!dataUrl.startsWith('data:') || comma < 0) throw new Error('State image must be a data URL')
  const b64 = dataUrl.slice(comma + 1)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Build and download a zip image pack from the current settings. */
export async function downloadImagePack(settings: CursorThemeSettings, filename: string): Promise<void> {
  if (typeof document === 'undefined') return
  const zip = new JSZip()
  const manifest: ImagePackManifest = {
    schema: IMAGE_PACK_SCHEMA,
    name: 'cursor-theme',
    version: '1.0.0',
    enabled: settings.enabled,
    defaultSize: settings.defaultSize,
    states: {},
  }
  const names = new Set<string>()
  for (const [stateId, cfg] of Object.entries(settings.states)) {
    if (!cfg?.image) continue
    const safe = stateId.replace(/[^a-z0-9-]/gi, '_') || 'state'
    let fileName = `${safe}.png`
    let n = 2
    while (names.has(fileName)) fileName = `${safe}-${n++}.png`
    names.add(fileName)
    zip.file(fileName, dataUrlToBytes(cfg.image))
    manifest.states[stateId] = {
      file: fileName,
      ...cfg.hotspot ? { hotspot: cfg.hotspot } : {},
      ...cfg.size ? { size: cfg.size } : {},
    }
  }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Parse a zip image pack (given as a data URL of the zip) into a settings
 * fragment. Throws a readable Error on any problem (fail closed).
 * Oversized images (> MAX_CURSOR_PIXEL) are auto-scaled to the browser
 * cursor limit when a canvas is available; the scaled state ids are
 * reported via the `scaled` field so the UI can tell the user.
 */
export async function parseImagePack(dataUrl: string): Promise<{
  enabled?: boolean
  defaultSize?: number
  states: Record<string, CursorStateConfig>
  /** State ids whose images were auto-scaled down to the 128px cursor limit. */
  scaled?: string[]
}> {
  const comma = dataUrl.indexOf(',')
  if (!dataUrl.startsWith('data:') || comma < 0) throw new Error('Not a valid image pack file')
  const b64 = dataUrl.slice(comma + 1)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Not a valid ZIP image pack')
  }
  const manifestEntry = zip.file('manifest.json')
  if (!manifestEntry) throw new Error('Image pack is missing manifest.json')
  // Strip a UTF-8 BOM if present — Windows tooling (e.g. Notepad, PowerShell
  // 5.1 Set-Content) commonly writes one, which would break JSON.parse.
  const manifestText = (await manifestEntry.async('string')).replace(/^\uFEFF/, '')
  const manifest = JSON.parse(manifestText) as Partial<ImagePackManifest>
  if (manifest.schema !== IMAGE_PACK_SCHEMA) throw new Error(`Unsupported image pack schema ${String(manifest.schema)}`)
  if (typeof manifest.name !== 'string' || manifest.name.length === 0 || manifest.name.length > 80) throw new Error('Image pack needs a name')
  if (typeof manifest.states !== 'object' || manifest.states === null || Array.isArray(manifest.states)) throw new Error('Image pack needs a states map')
  const entries = Object.entries(manifest.states)
  if (entries.length === 0) throw new Error('Image pack has no states')
  if (entries.length > MAX_STATES) throw new Error('Image pack has too many states')
  const states: Record<string, CursorStateConfig> = {}
  const scaled: string[] = []
  for (const [stateId, meta] of entries) {
    if (typeof meta !== 'object' || meta === null) throw new Error(`State "${stateId}" entry is invalid`)
    const fileEntry = zip.file(meta.file)
    if (!fileEntry) throw new Error(`Image pack is missing ${meta.file}`)
    const fileBytes = await fileEntry.async('uint8array')
    if (fileBytes.byteLength > MAX_IMAGE_BYTES) throw new Error(`${meta.file} is too large (max 5 MB)`)
    let imageBytes = fileBytes
    let hotspot = meta.hotspot
    const dims = pngDimensions(fileBytes)
    if (dims && (dims.width > MAX_CURSOR_PIXEL || dims.height > MAX_CURSOR_PIXEL)) {
      const metrics = resizeMetrics(dims.width, dims.height)
      const resized = await resizePngBytes(fileBytes, metrics)
      if (resized) {
        imageBytes = resized
        scaled.push(stateId)
        if (hotspot) {
          hotspot = {
            x: Math.round(hotspot.x * metrics.scaleX + metrics.offsetX),
            y: Math.round(hotspot.y * metrics.scaleY + metrics.offsetY),
          }
        }
      }
      // No canvas available (node/test env): keep the original bytes.
    }
    const image = bytesToDataUrl(imageBytes)
    states[stateId] = {
      image,
      ...hotspot ? { hotspot } : {},
      ...meta.size ? { size: meta.size } : {},
    }
  }
  return {
    ...typeof manifest.enabled === 'boolean' ? { enabled: manifest.enabled } : {},
    ...typeof manifest.defaultSize === 'number' ? { defaultSize: manifest.defaultSize } : {},
    states,
    ...scaled.length > 0 ? { scaled } : {},
  }
}

/** Encode raw bytes as a PNG data URL. */
function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:image/png;base64,${btoa(binary)}`
}
