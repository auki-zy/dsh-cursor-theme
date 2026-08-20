/**
 * dsh-cursor-theme built-in theme catalog (M3b).
 *
 * Themes reference built-in asset ids (data/assets.json); resolution maps
 * each state → the asset's image/hotspot/size so the theme can be applied
 * as a normal `states` settings object.
 */

import assetsJson from '../../data/assets.json'
import type { CursorStateConfig } from './types.js'

export interface BuiltinTheme {
  id: string
  name: string
  description: string
  /** stateId → builtin asset id. */
  states: Record<string, string>
}

export const BUILTIN_THEMES: BuiltinTheme[] = (assetsJson as { themes: BuiltinTheme[] }).themes

const ASSET_BY_ID = new Map(
  (assetsJson as { assets: Array<{ id: string; image: string; hotspot: { x: number; y: number }; size: number }> }).assets
    .map((a) => [a.id, a]),
)

/**
 * Resolve a built-in theme into a `states` settings fragment.
 * @returns a map stateId → CursorStateConfig, or null if any referenced
 *   asset id is missing (defensive against stale data).
 */
export function resolveThemeStates(theme: BuiltinTheme): Record<string, CursorStateConfig> | null {
  const states: Record<string, CursorStateConfig> = {}
  for (const [stateId, assetId] of Object.entries(theme.states)) {
    const asset = ASSET_BY_ID.get(assetId)
    if (!asset) return null
    states[stateId] = {
      image: asset.image,
      hotspot: asset.hotspot,
      size: asset.size,
    }
  }
  return states
}
