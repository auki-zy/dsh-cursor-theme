/**
 * Image-pack (zip) import/export unit tests (M5).
 * - build: settings → zip with PNG files + manifest.json;
 * - parse: zip → settings fragment, validating every entry (fail closed).
 */
import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { parseImagePack, resizeMetrics, IMAGE_PACK_SCHEMA, MAX_IMAGE_BYTES } from '../src/client/pack.js'
import type { CursorThemeSettings } from '../src/client/types.js'

const PNG_1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

/** Minimal PNG with a valid signature + IHDR of the requested size. */
function pngBytesWithSize(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(64)
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  sig.forEach((b, i) => { bytes[i] = b })
  bytes[8] = 0; bytes[9] = 0; bytes[10] = 0; bytes[11] = 13 // IHDR length
  bytes[12] = 0x49; bytes[13] = 0x48; bytes[14] = 0x44; bytes[15] = 0x52 // "IHDR"
  bytes[16] = (width >>> 24) & 0xff; bytes[17] = (width >>> 16) & 0xff; bytes[18] = (width >>> 8) & 0xff; bytes[19] = width & 0xff
  bytes[20] = (height >>> 24) & 0xff; bytes[21] = (height >>> 16) & 0xff; bytes[22] = (height >>> 8) & 0xff; bytes[23] = height & 0xff
  return bytes
}

function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:image/png;base64,${btoa(binary)}`
}

async function makeZip(manifest: unknown, files: Record<string, string>): Promise<string> {
  const zip = new JSZip()
  zip.file('manifest.json', JSON.stringify(manifest))
  for (const [name, dataUrl] of Object.entries(files)) {
    const comma = dataUrl.indexOf(',')
    zip.file(name, dataUrl.slice(comma + 1), { base64: true })
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:application/zip;base64,${btoa(binary)}`
}

const goodManifest = {
  schema: IMAGE_PACK_SCHEMA,
  name: 'test',
  version: '1.0.0',
  enabled: true,
  states: {
    pointer: { file: 'pointer.png', hotspot: { x: 3, y: 3 }, size: 32 },
  },
}

describe('image pack', () => {
  it('parses a valid zip with one PNG + manifest', async () => {
    const dataUrl = await makeZip(goodManifest, { 'pointer.png': PNG_1x1 })
    const result = await parseImagePack(dataUrl)
    expect(result.states.pointer?.image).toBe(PNG_1x1)
    expect(result.states.pointer?.hotspot).toEqual({ x: 3, y: 3 })
    expect(result.enabled).toBe(true)
  })

  it('rejects non-zip input', async () => {
    await expect(parseImagePack('data:application/octet-stream;base64,AAAA')).rejects.toThrow(/ZIP/)
  })

  it('rejects zip without manifest', async () => {
    const zip = new JSZip()
    zip.file('pointer.png', 'x')
    const blob = await zip.generateAsync({ type: 'blob' })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    await expect(parseImagePack(`data:application/zip;base64,${btoa(binary)}`)).rejects.toThrow(/manifest/)
  })

  it('rejects wrong schema version', async () => {
    const dataUrl = await makeZip({ ...goodManifest, schema: 99 }, { 'pointer.png': PNG_1x1 })
    await expect(parseImagePack(dataUrl)).rejects.toThrow(/schema/)
  })

  it('rejects missing image file', async () => {
    const dataUrl = await makeZip(goodManifest, {})
    await expect(parseImagePack(dataUrl)).rejects.toThrow(/missing pointer.png/)
  })

  it('rejects empty states', async () => {
    const dataUrl = await makeZip({ ...goodManifest, states: {} }, {})
    await expect(parseImagePack(dataUrl)).rejects.toThrow(/no states/)
  })

  it('fills defaults when hotspot/size are absent', async () => {
    const dataUrl = await makeZip(
      { ...goodManifest, states: { pointer: { file: 'pointer.png' } } },
      { 'pointer.png': PNG_1x1 },
    )
    const result = await parseImagePack(dataUrl)
    expect(result.states.pointer?.hotspot).toBeUndefined()
    expect(result.states.pointer?.size).toBeUndefined()
  })

  it('accepts images above the old 2 MB cap (cap raised to 5 MB)', async () => {
    // 2.5 MB — rejected at the 2 MB cap, accepted now.
    const mid = 'data:image/png;base64,' + btoa('a'.repeat(MAX_IMAGE_BYTES / 2))
    const dataUrl = await makeZip(goodManifest, { 'pointer.png': mid })
    const result = await parseImagePack(dataUrl)
    expect(result.states.pointer?.image).toBe(mid)
  })

  it('rejects an image above the 5 MB cap', async () => {
    const over = 'data:image/png;base64,' + btoa('a'.repeat(MAX_IMAGE_BYTES + 1))
    const dataUrl = await makeZip(goodManifest, { 'pointer.png': over })
    await expect(parseImagePack(dataUrl)).rejects.toThrow(/too large/)
  })

  it('computes contain-scale metrics and centered offsets', () => {
    expect(resizeMetrics(256, 256)).toEqual({ scaleX: 0.5, scaleY: 0.5, offsetX: 0, offsetY: 0 })
    expect(resizeMetrics(512, 256)).toEqual({ scaleX: 0.25, scaleY: 0.25, offsetX: 0, offsetY: 32 })
    expect(resizeMetrics(64, 64)).toEqual({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 })
    expect(resizeMetrics(0, 0)).toEqual({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 })
  })

  it('accepts a manifest with a UTF-8 BOM', async () => {
    // Windows tooling often writes a BOM-prefixed manifest.json; JSON.parse
    // would throw on it, so the parser must strip it.
    const zip = new JSZip()
    zip.file('manifest.json', '\uFEFF' + JSON.stringify(goodManifest))
    const comma = PNG_1x1.indexOf(',')
    zip.file('pointer.png', PNG_1x1.slice(comma + 1), { base64: true })
    const blob = await zip.generateAsync({ type: 'blob' })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const result = await parseImagePack(`data:application/zip;base64,${btoa(binary)}`)
    expect(result.states.pointer?.image).toBe(PNG_1x1)
  })

  it('keeps oversized PNGs unchanged and does not report scaling without a canvas', async () => {
    // 256×256 PNG header — oversized for cursor: url(...), but the node test
    // env has no canvas, so the parser must keep the bytes as-is (the browser
    // path auto-scales them).
    const dataUrl = await makeZip(goodManifest, { 'pointer.png': bytesToDataUrl(pngBytesWithSize(256, 256)) })
    const result = await parseImagePack(dataUrl)
    expect(result.scaled).toBeUndefined()
    expect(result.states.pointer?.hotspot).toEqual({ x: 3, y: 3 })
    expect(result.states.pointer?.image?.startsWith('data:image/png;base64,')).toBe(true)
  })
})

/** Compile-time guard: the settings type still matches the new model. */
export type _Guard = CursorThemeSettings
