/**
 * dsh-cursor-theme client entry — M2: settings section UI.
 *
 * Loaded by the DSH web client through `dsh.client.inject` in package.json;
 * the host wraps this module in `window.__ModuleLoader__.load({ id, factory })`
 * (see scripts/wrap-client.mjs).
 *
 * M2 wiring:
 *   1. Inject the style tag + subscribe to settings (M1 behavior preserved).
 *   2. Register a `settings.section` page (设置 → 插件 → 光标主题) that
 *      edits the `dsh-cursor-theme` settings namespace.
 *   3. settingsScope and slots are injected NESTED where the host provides
 *      them; the bundle still mounts on hosts without those services (style
 *      injection keeps working, the section simply never appears).
 */

import { applyCursorCss } from './style.js'
import { CursorThemeSection, type CardScope } from './section.js'
import { en, zh } from './locales.js'
import { applyColorScheme, type ColorScheme } from './follow.js'
import type { CursorThemeSettings } from './types.js'

/** Bundle-layer identity, matching cordis.patch.yml's `id`. */
export const name = 'dsh-cursor-theme'

/**
 * Host services this client bundle requires at mount. Empty: the settings
 * UI surface is registered through nested injects below.
 */
export const inject: string[] = []

/** Structural subset of the client-side Cordis context this bundle touches. */
interface ClientContext {
  effect(callback: () => unknown, label?: string): void
  inject(services: string[], callback: (scoped: unknown) => void): void
  on?(event: string, callback: () => void): () => void
}

/** Structural subset of a settings scope (dsh-client-runtime). */
interface SettingsScope {
  bind(options: { namespace: string }): CardScope
}

/** Structural subset of the locale service. */
interface LocaleService {
  register(namespace: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): unknown
  bind(namespace: string): (key: string) => string
}

/** Structural subset of the slots service. */
interface SlotsService {
  inject(slot: string, register: () => unknown): void
  register(options: Record<string, unknown>, component: (props: Record<string, unknown>) => unknown): unknown
}

/** Structural subset of the theme service (dsh-client-ui-theme). */
interface ThemeService {
  getTheme(): { active?: { colorScheme?: string } } | null
}

/** Defaults when the settings service is absent or the value is empty. */
const DEFAULT_SETTINGS: CursorThemeSettings = {
  enabled: true,
  followTheme: false,
  fallback: 'auto',
  defaultSize: 32,
  states: {},
}

const NS = 'dsh-cursor-theme'

export function apply(ctx: ClientContext): void {
  const tagId = 'dsh-cursor-theme'

  // 1) Style tag + settings-driven rendering (M1).
  let tag: HTMLStyleElement | null = null
  ctx.effect(() => {
    if (typeof document === 'undefined') return
    const existing = document.querySelector<HTMLStyleElement>(`style[data-plugin-css="${tagId}"]`)
    if (existing) {
      tag = existing
      return
    }
    const created = document.createElement('style')
    created.dataset.plugin = 'dsh-cursor-theme'
    created.dataset.pluginCss = tagId
    created.textContent = ''
    document.head.appendChild(created)
    tag = created
  }, 'dsh-cursor-theme: style tag')

  ctx.inject(['settingsScope'], (scoped) => {
    const scope = (scoped as { settingsScope: SettingsScope }).settingsScope.bind({ namespace: NS })
    // Track the current color scheme (light/dark) from the theme service.
    let scheme: ColorScheme = 'light'
    let theme: ThemeService | null = null
    const readScheme = (): ColorScheme => {
      const snap = theme?.getTheme?.()
      return snap?.active?.colorScheme === 'dark' ? 'dark' : 'light'
    }
    const render = () => {
      if (!tag) return
      const snapshot = scope.getSnapshot()
      const settings = snapshot.status === 'ready' && snapshot.value
        ? snapshot.value
        : DEFAULT_SETTINGS
      applyCursorCss(tag, applyColorScheme(settings, scheme))
    }
    scope.subscribe(render)
    render()
    // When the host provides the theme service, re-render on scheme change.
    ctx.inject(['theme'], (scopedT) => {
      theme = (scopedT as { theme: ThemeService }).theme
      scheme = readScheme()
      render()
      ctx.on?.('theme/change', () => {
        scheme = readScheme()
        render()
      })
    })
  })

  // 2) Settings section UI (M2). Nested injects: locale + slots must exist
  //    for the section to render; otherwise it silently stays absent.
  ctx.inject(['locale', 'slots'], (scoped) => {
    const host = scoped as { locale: LocaleService; slots: SlotsService }
    host.locale.register(NS, { zh, en })
    const t = host.locale.bind(NS)

    ctx.inject(['settingsScope'], (scoped2) => {
      const scope = (scoped2 as { settingsScope: SettingsScope }).settingsScope.bind({ namespace: NS })
      host.slots.inject('settings.section', () => host.slots.register({
        name: 'settings.section',
        id: 'cursor-theme',
        order: 50,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ scope, t }),
      }, CursorThemeSection as unknown as (props: Record<string, unknown>) => unknown))
    })
  })
}
