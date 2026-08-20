/**
 * dsh-cursor-theme light/dark follow logic (M3d).
 *
 * When `followTheme` is on, built-in assets swap to the palette that reads
 * best on the DSH color scheme: light UI → dark cursors, dark UI → light
 * cursors. Uploaded/custom images (data URLs not in the built-in catalog)
 * are left untouched — they are the user's explicit choice.
 *
 * The swap is applied at render time only; persisted settings are never
 * rewritten, so toggling followTheme off restores the original choices.
 */

import type { CursorThemeSettings } from './types.js'

export type ColorScheme = 'light' | 'dark'

/** Built-in asset id → its image data URL (for membership + lookup). */
const ASSET_IDS = new Map<string, string>()

// Lazily populated from the catalog; imported here avoids a circular dep
// with assets.ts while keeping the lookup table local.
import assetsJson from '../../data/assets.json'

for (const a of (assetsJson as { assets: Array<{ id: string; image: string }> }).assets) {
  ASSET_IDS.set(a.id, a.image)
}

/** Map built-in asset id → the same shape in the other palette. */
const PALETTE_PAIR: Record<string, string> = {}
for (const id of ASSET_IDS.keys()) {
  const m = /^(.+)-(dark|light)$/.exec(id)
  if (m) PALETTE_PAIR[id] = `${m[1]}-${m[2] === 'dark' ? 'light' : 'dark'}`
}

/**
 * Resolve the effective settings for a given color scheme, applying the
 * built-in palette swap when followTheme is on.
 */
export function applyColorScheme(settings: CursorThemeSettings, scheme: ColorScheme): CursorThemeSettings {
  if (!settings.followTheme) return settings
  const targetPalette = scheme === 'light' ? 'dark' : 'light' // light UI → dark cursor
  const states: Record<string, import('./types.js').CursorStateConfig> = {}
  for (const [stateId, cfg] of Object.entries(settings.states)) {
    if (!cfg?.image) {
      states[stateId] = cfg
      continue
    }
    // Find which built-in asset this image belongs to; if it's from a
    // palette, swap to the target palette's twin.
    let swapped = cfg
    for (const [assetId, image] of ASSET_IDS) {
      if (image !== cfg.image) continue
      const m = /^(.+)-(dark|light)$/.exec(assetId)
      if (m && m[2] !== targetPalette) {
        const twin = ASSET_IDS.get(`${m[1]}-${targetPalette}`)
        if (twin !== undefined) swapped = { ...cfg, image: twin }
      }
      break
    }
    states[stateId] = swapped
  }
  return { ...settings, states }
}
