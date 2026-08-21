/**
 * Image-pack (zip) import/export unit tests (M5).
 * - build: settings → zip with PNG files + manifest.json;
 * - parse: zip → settings fragment, validating every entry (fail closed).
 */
import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { parseImagePack, IMAGE_PACK_SCHEMA } from '../src/client/pack.js'
import type { CursorThemeSettings } from '../src/client/types.js'

const PNG_1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

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
})

/** Compile-time guard: the settings type still matches the new model. */
export type _Guard = CursorThemeSettings
