/**
 * dsh-cursor-theme host entry — aligned with deepseek-harness-desktop
 * plugin conventions (see dsh-community-market's host entry).
 *
 * Registers the persisted settings namespace (`dsh-cursor-theme`) with the
 * host settings service so the user's cursor configuration survives restarts
 * and is editable from the host-managed plugin configuration page. The
 * actual per-state cursor CSS is rendered client-side (client/client.js)
 * from that same namespace.
 *
 * Desktop-aligned wiring:
 *   - Module-level `inject: ['settings']` declaration (same shape as the
 *     official market's `inject: ['webServer', 'settings']`); the settings
 *     consumer wiring in schema.ts rides it.
 *   - No lifecycle scripts, no GitHub install target, rc.7-compatible peer
 *     dependencies, and a `dsh.bundle.patch` — all requirements of the
 *     Desktop managed installer (dsh-community-market/docs/
 *     install-and-uninstall.md).
 *
 * See docs/requirements.md, docs/feasibility.md and docs/release.md.
 */

import type { Context } from '@deepseek-ai/cordis'
import { installCursorThemeSettings, type CursorThemeSettings } from './schema.js'

export const name = 'dsh-cursor-theme'

/**
 * Host services this plugin requires at mount — module-level declaration in
 * the official desktop style. `settings` is guaranteed by the DSH runtime;
 * a host without it keeps the plugin inert rather than crashing.
 */
export const inject: string[] = ['settings']

/**
 * Register the plugin against the host context.
 * @param ctx - Host context (provides the `settings` service).
 * @param config - Optional profile override from the loader.
 */
export function apply(ctx: Context, config?: Partial<CursorThemeSettings>): void {
  // Compose the entry (schema base) from the loader config with defaults.
  const entry: CursorThemeSettings = {
    enabled: config?.enabled ?? true,
    followTheme: config?.followTheme ?? false,
    fallback: config?.fallback ?? 'auto',
    defaultSize: config?.defaultSize ?? 32,
    states: config?.states ?? {},
  }
  installCursorThemeSettings(ctx, entry)
  ctx.logger?.info?.('[dsh-cursor-theme] host entry loaded (settings namespace registered)')
}
