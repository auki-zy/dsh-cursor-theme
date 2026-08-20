/**
 * dsh-cursor-theme client style generator.
 *
 * Renders the persisted settings into a single CSS string of per-state
 * `cursor:` rules and applies it to the plugin's style tag. Design rules:
 *
 * - Every rule appends the state's fallback keyword
 *   (`cursor: url(...) x y, <keyword>;`). A missing/oversized/blocked image
 *   therefore degrades to a usable cursor, never to `none` (accessibility
 *   NFR §5).
 * - When the master switch is off, or a state has no image, no override is
 *   emitted for it — the composed UI keeps its natural cursor.
 * - Images ride `data:` URLs (uploaded/builtin assets), so no CSP or
 *   network dependency; see feasibility.md §5 risk #5.
 */

import type { CursorStateConfig, CursorThemeSettings } from './types.js'
import { CURSOR_STATES } from './states.js'

/** Clamp to browser-safe cursor image size (feasibility.md §2.3). */
const MAX_CURSOR_SIZE = 128

function stateCss(def: { id: string; selectors: string[]; fallback: string }, cfg: CursorStateConfig | undefined, defaultSize: number): string | null {
  if (!cfg?.image) return null
  // Browsers reject cursor images >128px wholesale (feasibility.md §2.3);
  // the stored size is clamped for future scaled-bitmap rendering and as a
  // settings-UI hint — `cursor: url()` has no size keyword, the browser uses
  // the image's natural size.
  const size = cfg.size ?? defaultSize
  const clamped = Math.max(1, Math.min(MAX_CURSOR_SIZE, size))
  const hx = cfg.hotspot?.x ?? 0
  const hy = cfg.hotspot?.y ?? 0
  return `${def.selectors.join(',\n')} { cursor: url("${cfg.image}") ${hx} ${hy}, ${def.fallback}; }`
}

/** Build the full stylesheet text for a settings snapshot. */
export function renderCursorCss(settings: CursorThemeSettings): string {
  if (!settings.enabled) return ''
  const lines: string[] = []
  for (const def of CURSOR_STATES) {
    const css = stateCss(def, settings.states?.[def.id], settings.defaultSize)
    if (css) lines.push(css)
  }
  return lines.join('\n')
}

/** Apply a settings snapshot to the plugin's style tag (create if absent). */
export function applyCursorCss(tag: HTMLStyleElement, settings: CursorThemeSettings): void {
  tag.textContent = renderCursorCss(settings)
}
