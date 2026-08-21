/**
 * dsh-cursor-theme built-in theme catalog (M5 / M6).
 *
 * Two theme kinds:
 *  - Template themes: a palette + full 14-state → template map; applying
 *    substitutes the palette into each template and renders SVG → PNG.
 *  - Prebuilt themes: states already carry baked PNG data URLs (e.g. the
 *    scraped BlueArchive theme, MIT-licensed). Applied directly, no render.
 */

import assetsJson from '../../data/assets.json'
import bluearchiveJson from '../../data/themes-bluearchive.json'
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
  states: Record<string, string>
  /** Prebuilt themes: stateId → ready-to-use config (baked PNG). */
  prebuilt?: Record<string, CursorStateConfig>
  /** Source attribution (required by licenses like MIT). */
  attribution?: string
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

/** The BlueArchive theme scraped from GitHub (MIT). */
const BLUEARCHIVE: BuiltinTheme = {
  id: 'bluearchive',
  name: 'BlueArchive',
  description: '二次元人气光标主题（源自 GitHub makipom/BlueArchive-Cursors，MIT 许可）',
  states: Object.fromEntries(
    Object.keys((bluearchiveJson as { states: Record<string, CursorStateConfig> }).states).map((s) => [s, s]),
  ),
  prebuilt: (bluearchiveJson as { states: Record<string, CursorStateConfig> }).states,
  attribution: 'BlueArchive-Cursors © 2023 Maki (MIT) — github.com/makipom/BlueArchive-Cursors',
}

export const BUILTIN_THEMES: BuiltinTheme[] = [
  ...(assetsJson as { themes: BuiltinTheme[] }).themes,
  BLUEARCHIVE,
]

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
  if (!theme.palette) return null
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
