/**
 * dsh-cursor-theme built-in theme catalog (M7).
 *
 * Themes come from data/assets.json, which the generator (generate-assets.mjs)
 * builds by merging theme packs (scripts/generate-theme-packs.mjs → 
 * data/themes-*.json). All preset themes are ORIGINAL art (own SVGs +
 * palettes), so no third-party license management is needed. Each theme is
 * "prebuilt": states already carry baked PNG data URLs, so applying is
 * instant (no SVG render).
 *
 * The SVG template library (assets.json templates) is still used by the
 * per-state built-in picker in the editor.
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
  /** Template themes: palette + stateId → template id map. */
  palette?: ThemePalette
  /** stateId → template id (template themes) — kept for compatibility. */
  states?: Record<string, string>
  /** Prebuilt themes: stateId → ready-to-use config (baked PNG). */
  prebuilt?: Record<string, CursorStateConfig>
  /** Origin marker ('original' for generated packs). */
  source?: string
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
 * Resolve a theme into a `states` settings fragment.
 * Prebuilt themes return their baked configs directly; template themes
 * substitute the palette into each state's template and render to PNG.
 * @returns stateId → CursorStateConfig, or null on any failure.
 */
export async function resolveThemeStates(theme: BuiltinTheme): Promise<Record<string, CursorStateConfig> | null> {
  if (theme.prebuilt) return JSON.parse(JSON.stringify(theme.prebuilt)) as Record<string, CursorStateConfig>
  if (!theme.palette || !theme.states) return null
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
