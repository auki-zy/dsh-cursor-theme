/**
 * dsh-cursor-theme settings: the persisted configuration namespace.
 *
 * Registered host-side via `installSettingsSection` (dsh >= 0.1.0-rc.7) so
 * the plugin's options appear on the host-managed plugin configuration page
 * and survive restarts. The client bundle reads the same namespace through
 * `settingsScope.bind({ namespace })` and re-renders cursor CSS on change.
 *
 * Mirrors the pattern in dshmarket/src/settings.ts.
 */

import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

/** Namespace the client bundle keys itself to (lowercase kebab-case). */
export const CURSOR_SETTINGS_NS = settingsNamespace('dsh-cursor-theme')

/**
 * One UI-state cursor override. Absent = that state keeps the composed
 * fallback (system default), never forced.
 */
export interface CursorStateConfig {
  /** Image reference. data: URL (uploaded/builtin) or '' for fallback-only. */
  image?: string
  /** Hotspot [x, y] in CSS pixels; defaults to [0, 0]. */
  hotspot?: { x: number; y: number }
  /** Display size in px (16/24/32/48; >128 rejected by browsers). */
  size?: number
}

/** Resolved plugin configuration (schema defaults + user overrides). */
export interface CursorThemeSettings {
  /** Master switch: false removes all injected cursor rules. */
  enabled: boolean
  /** Follow the DSH light/dark scheme and swap built-in palettes. */
  followTheme: boolean
  /** Global fallback keyword used when no image applies. */
  fallback: string
  /** Default display size for states without their own size. */
  defaultSize: number
  /** Per-UI-state overrides keyed by state id (see client states table). */
  states: Record<string, CursorStateConfig>
}

const CursorStateConfig: z<CursorStateConfig> = z.object({
  image: z.string(),
  hotspot: z.object({ x: z.number(), y: z.number() }),
  size: z.natural().min(1).max(128),
})

export const CursorThemeSettings: z<CursorThemeSettings> = z.object({
  enabled: z.boolean().default(true),
  followTheme: z.boolean().default(false),
  fallback: z.string().default('auto'),
  defaultSize: z.natural().min(1).max(128).default(32),
  states: z.dict(CursorStateConfig).default({}),
})

/**
 * Wire the namespace into the host settings service. The client bundle is
 * the writer and the live reader; host-side registration only makes the
 * section exist and be persisted by the provider.
 *
 * @param ctx - the plugin context owning the wiring.
 * @param entry - composed entry config used as the schema `base` layer.
 */
export function installCursorThemeSettings(ctx: Context, entry: CursorThemeSettings): void {
  installSettingsSection(ctx, CURSOR_SETTINGS_NS, CursorThemeSettings, entry, {
    // Host has nothing to recompute on change in M1; the client re-renders
    // from its own settingsScope subscription. Keep the sink wired so a
    // future host half (e.g. asset registry) can react.
    setSource: () => undefined,
    onChange: () => undefined,
  })
}
