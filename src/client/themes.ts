/**
 * dsh-cursor-theme built-in theme catalog (M5).
 *
 * A theme is a palette plus a full 14-state → template map. Applying a theme
 * substitutes the palette into each template's placeholders and renders the
 * SVG to a PNG data URL (canvas, render.ts). Every theme therefore covers
 * ALL states with a consistent look.
 */

import assetsJson from '../../data/assets.json'
import type { CursorStateConfig } from './types.js'
import { renderSvgToDataUrl } from './render.js'

export interface ThemePalette {
  primary: string
  accent: string
  dark: string
}

export interface BuiltinTheme {
  id: string
  name: string
  description: string
  palette: ThemePalette
  /** stateId → template id. Covers all 14 states. */
  states: Record<string, string>
}

export interface BuiltinTemplate {
  id: string
  name: string
  states: string[]
  fallback: string
  hotspot: { x: number; y: number }
  size: number
  svg: string
}

export const BUILTIN_THEMES: BuiltinTheme[] = (assetsJson as { themes: BuiltinTheme[] }).themes

const TEMPLATES: BuiltinTemplate[] = (assetsJson as { templates: BuiltinTemplate[] }).templates
const TEMPLATE_BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]))

/** Substitute a theme palette into a template's placeholders. */
export function applyPalette(svg: string, palette: ThemePalette): string {
  return svg
    .replace(/\{primary\}/g, palette.primary)
    .replace(/\{accent\}/g, palette.accent)
    .replace(/\{dark\}/g, palette.dark)
}

/**
 * Resolve a theme into a `states` settings fragment: substitute the palette
 * into every state's template and render each to a PNG data URL.
 * @returns stateId → CursorStateConfig, or null if any template is missing.
 */
export async function resolveThemeStates(theme: BuiltinTheme): Promise<Record<string, CursorStateConfig> | null> {
  const states: Record<string, CursorStateConfig> = {}
  for (const [stateId, templateId] of Object.entries(theme.states)) {
    const tpl = TEMPLATE_BY_ID.get(templateId)
    if (!tpl) return null
    const image = await renderSvgToDataUrl(applyPalette(tpl.svg, theme.palette), 32)
    if (!image) return null
    states[stateId] = {
      image,
      hotspot: tpl.hotspot,
      size: tpl.size,
    }
  }
  return states
}
