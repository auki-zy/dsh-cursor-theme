/**
 * dsh-cursor-theme client-local types (structural, no cross-package deps).
 *
 * Mirrors the host-side settings schema (src/schema.ts). Duplicated on
 * purpose: the client bundle must stay self-contained (bundle-purity gate),
 * matching the ecosystem convention (e.g. dshmarket declares its own
 * structural client interfaces).
 */

/** One UI-state cursor override. */
export interface CursorStateConfig {
  /** Image reference; `data:` URL for uploaded/builtin assets. */
  image?: string
  /** Hotspot {x, y} in CSS pixels; defaults to {0, 0}. */
  hotspot?: { x: number; y: number }
  /** Display size in px (16/24/32/48; >128 rejected by browsers). */
  size?: number
}

/** Resolved plugin configuration (schema defaults + user overrides). */
export interface CursorThemeSettings {
  /** Master switch: false removes all injected cursor rules. */
  enabled: boolean
  /** Global fallback keyword used when no image applies. */
  fallback: string
  /** Default display size for states without their own size. */
  defaultSize: number
  /** Per-UI-state overrides keyed by state id. */
  states: Record<string, CursorStateConfig>
}
