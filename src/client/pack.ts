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

const MAX_IMAGE_BYTES = 512 * 1024
const MAX_STATES = 32

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
 */
export async function parseImagePack(dataUrl: string): Promise<{ enabled?: boolean; defaultSize?: number; states: Record<string, CursorStateConfig> }> {
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
  const manifest = JSON.parse(await manifestEntry.async('string')) as Partial<ImagePackManifest>
  if (manifest.schema !== IMAGE_PACK_SCHEMA) throw new Error(`Unsupported image pack schema ${String(manifest.schema)}`)
  if (typeof manifest.name !== 'string' || manifest.name.length === 0 || manifest.name.length > 80) throw new Error('Image pack needs a name')
  if (typeof manifest.states !== 'object' || manifest.states === null || Array.isArray(manifest.states)) throw new Error('Image pack needs a states map')
  const entries = Object.entries(manifest.states)
  if (entries.length === 0) throw new Error('Image pack has no states')
  if (entries.length > MAX_STATES) throw new Error('Image pack has too many states')
  const states: Record<string, CursorStateConfig> = {}
  for (const [stateId, meta] of entries) {
    if (typeof meta !== 'object' || meta === null) throw new Error(`State "${stateId}" entry is invalid`)
    const fileEntry = zip.file(meta.file)
    if (!fileEntry) throw new Error(`Image pack is missing ${meta.file}`)
    const fileBytes = await fileEntry.async('uint8array')
    if (fileBytes.byteLength > MAX_IMAGE_BYTES) throw new Error(`${meta.file} is too large (max 512 KB)`)
    const image = bytesToDataUrl(fileBytes)
    states[stateId] = {
      image,
      ...meta.hotspot ? { hotspot: meta.hotspot } : {},
      ...meta.size ? { size: meta.size } : {},
    }
  }
  return {
    ...typeof manifest.enabled === 'boolean' ? { enabled: manifest.enabled } : {},
    ...typeof manifest.defaultSize === 'number' ? { defaultSize: manifest.defaultSize } : {},
    states,
  }
}

/** Encode raw bytes as a PNG data URL. */
function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:image/png;base64,${btoa(binary)}`
}
