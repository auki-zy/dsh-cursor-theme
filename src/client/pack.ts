/**
 * dsh-cursor-theme theme pack import/export (M3c).
 *
 * A theme pack is a standalone JSON document embedding every image as a
 * data URL, so it can be shared across machines without the plugin's
 * built-in catalog. Import validates structure and size budget before
 * applying (requirements.md §4.8: failed import must not touch current
 * config).
 */

import type { CursorThemeSettings } from './types.js'

/** Importable theme pack shape (superset of settings). */
export interface ThemePack {
  schema: number
  name: string
  version: string
  settings: CursorThemeSettings
}

export const THEME_PACK_SCHEMA = 1

const MAX_PACK_BYTES = 2 * 1024 * 1024 // 2 MB — generous for embedded base64
const MAX_IMAGE_BYTES = 512 * 1024

/** Build a shareable pack from the current settings. */
export function buildThemePack(settings: CursorThemeSettings, name: string): ThemePack {
  return {
    schema: THEME_PACK_SCHEMA,
    name,
    version: '1.0.0',
    settings: JSON.parse(JSON.stringify(settings)) as CursorThemeSettings,
  }
}

/** Serialize a pack to a pretty JSON string. */
export function serializeThemePack(pack: ThemePack): string {
  return JSON.stringify(pack, null, 2)
}

/** Parse and validate a theme pack; throws a readable Error on failure. */
export function parseThemePack(text: string): ThemePack {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Not valid JSON')
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('Theme pack must be a JSON object')
  const pack = raw as Partial<ThemePack>
  if (pack.schema !== THEME_PACK_SCHEMA) throw new Error(`Unsupported theme pack schema ${String(pack.schema)}`)
  if (typeof pack.name !== 'string' || pack.name.length === 0 || pack.name.length > 80) throw new Error('Theme pack needs a name (1-80 chars)')
  const settings = pack.settings
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) throw new Error('Theme pack is missing settings')
  const s = settings as Partial<CursorThemeSettings>
  if (typeof s.enabled !== 'boolean') s.enabled = true
  if (typeof s.followTheme !== 'boolean') s.followTheme = false
  if (typeof s.fallback !== 'string' || s.fallback.length === 0) s.fallback = 'auto'
  if (typeof s.defaultSize !== 'number' || !Number.isInteger(s.defaultSize) || s.defaultSize < 1 || s.defaultSize > 128) s.defaultSize = 32
  if (typeof s.states !== 'object' || s.states === null || Array.isArray(s.states)) s.states = {}
  // Validate every image is an inline data URL within budget.
  const serialized = JSON.stringify(s.states)
  if (serialized.length > MAX_PACK_BYTES) throw new Error('Theme pack is too large')
  for (const [stateId, cfg] of Object.entries(s.states as Record<string, Partial<{ image?: string }>>)) {
    if (typeof stateId !== 'string' || stateId.length === 0 || stateId.length > 64) throw new Error('Theme pack has an invalid state id')
    if (cfg?.image !== undefined) {
      if (typeof cfg.image !== 'string' || !cfg.image.startsWith('data:')) throw new Error(`State "${stateId}" image must be an inline data URL`)
      // base64 payload size ≈ 3/4 of the string length after the comma
      const comma = cfg.image.indexOf(',')
      const payloadLen = comma >= 0 ? cfg.image.length - comma - 1 : cfg.image.length
      if ((payloadLen * 3) / 4 > MAX_IMAGE_BYTES) throw new Error(`State "${stateId}" image is too large (max 512 KB)`)
    }
  }
  return {
    schema: THEME_PACK_SCHEMA,
    name: pack.name,
    version: pack.version ?? '1.0.0',
    settings: {
      enabled: s.enabled,
      followTheme: s.followTheme,
      fallback: s.fallback,
      defaultSize: s.defaultSize,
      states: s.states as CursorThemeSettings['states'],
    },
  }
}

/** Trigger a browser download of the given text as a JSON file. */
export function downloadText(filename: string, text: string): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
