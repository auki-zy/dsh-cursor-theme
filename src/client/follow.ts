/**
 * dsh-cursor-theme light/dark follow logic (M3d, M4 rework).
 *
 * When `followTheme` is on, built-in assets swap so the cursor stays visible
 * on the current DSH color scheme. The swap is a per-asset "twin" lookup:
 * every built-in asset id is `<shape>-<palette>`; each palette is declared
 * light-safe or dark-safe, and the twin is the same shape in the opposite
 * role (e.g. `cat-coral` (light-safe) ↔ `cat-dark` (dark-safe)). Uploaded /
 * custom images are left untouched.
 *
 * Applied at render time only; persisted settings are never rewritten, so
 * toggling followTheme off restores the original choices.
 */

import type { CursorThemeSettings } from './types.js'

export type ColorScheme = 'light' | 'dark'

/** Which palette each asset id suffix uses — 'light' or 'dark' role. */
const PALETTE_ROLE: Record<string, 'light' | 'dark'> = {
  dark: 'dark',      // near-black → good on light UI
  light: 'light',    // near-white → good on dark UI
  neon: 'light',     // bright cyan → good on dark UI
  coral: 'light',
  lemon: 'light',
  mint: 'light',
  grape: 'light',
  sky: 'light',
  blush: 'light',
  peach: 'light',
  cocoa: 'dark',     // brown → dark on light UI
  mintDark: 'dark',
}

/** Built-in asset id → image data URL. */
const ASSET_BY_ID = new Map<string, string>()
/** asset id → { shape, palette }. */
const ASSET_META: Record<string, { shape: string; palette: string }> = {}

import assetsJson from '../../data/assets.json'

for (const a of (assetsJson as { assets: Array<{ id: string; image: string }> }).assets) {
  ASSET_BY_ID.set(a.id, a.image)
  const m = /^(.+)-([a-zA-Z]+)$/.exec(a.id)
  if (m) ASSET_META[a.id] = { shape: m[1], palette: m[2] }
}

/** Find the twin of an asset id in the target role (same shape, other role). */
function twinOf(assetId: string, targetRole: 'light' | 'dark'): string | undefined {
  const meta = ASSET_META[assetId]
  if (!meta) return undefined
  const currentRole = PALETTE_ROLE[meta.palette]
  if (currentRole === targetRole) return assetId // already suitable
  // Prefer an exact shape+role twin, else fall back to monochrome dark/light.
  for (const [id, m] of Object.entries(ASSET_META)) {
    if (m.shape === meta.shape && PALETTE_ROLE[m.palette] === targetRole) return id
  }
  const fallbackPalette = targetRole === 'dark' ? 'dark' : 'light'
  const fb = `${meta.shape}-${fallbackPalette}`
  return ASSET_BY_ID.has(fb) ? fb : undefined
}

/**
 * Resolve the effective settings for a color scheme, swapping built-in
 * assets to the visible role when followTheme is on.
 */
export function applyColorScheme(settings: CursorThemeSettings, scheme: ColorScheme): CursorThemeSettings {
  if (!settings.followTheme) return settings
  const targetRole: 'light' | 'dark' = scheme === 'light' ? 'dark' : 'light' // light UI → dark cursor
  const states: Record<string, import('./types.js').CursorStateConfig> = {}
  for (const [stateId, cfg] of Object.entries(settings.states)) {
    if (!cfg?.image) {
      states[stateId] = cfg
      continue
    }
    let swapped = cfg
    for (const [assetId, image] of ASSET_BY_ID) {
      if (image !== cfg.image) continue
      const twin = twinOf(assetId, targetRole)
      if (twin !== undefined && twin !== assetId) {
        const twinImage = ASSET_BY_ID.get(twin)
        if (twinImage !== undefined) swapped = { ...cfg, image: twinImage }
      }
      break
    }
    states[stateId] = swapped
  }
  return { ...settings, states }
}
