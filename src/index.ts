/**
 * dsh-cursor-theme host entry.
 *
 * M1: registers the persisted settings namespace (`dsh-cursor-theme`) with
 * the host settings service so the user's cursor configuration survives
 * restarts and is editable from the host-managed plugin configuration page.
 * The actual per-state cursor CSS is rendered client-side (client/client.js)
 * from that same namespace.
 *
 * See docs/requirements.md and docs/feasibility.md for the full plan.
 */

import { installCursorThemeSettings, type CursorThemeSettings } from './schema.js'

export const name = 'dsh-cursor-theme'

/**
 * Register the plugin against the host context.
 * @param ctx - Host context (may acquire settings / webServer / loader services).
 * @param config - Optional profile override from the loader.
 */
export function apply(ctx: { logger?: { info?: (...args: unknown[]) => void; warn?: (...args: unknown[]) => void }; inject?: (services: string[], fn: (host: unknown) => void) => void }, config?: Partial<CursorThemeSettings>): void {
  // Compose the entry (schema base) from the loader config with defaults.
  const entry: CursorThemeSettings = {
    enabled: config?.enabled ?? true,
    followTheme: config?.followTheme ?? false,
    fallback: config?.fallback ?? 'auto',
    defaultSize: config?.defaultSize ?? 32,
    states: config?.states ?? {},
  }
  installCursorThemeSettings(ctx as never, entry)
  ctx.logger?.info?.('[dsh-cursor-theme] host entry loaded (M1: settings namespace registered)')
}
