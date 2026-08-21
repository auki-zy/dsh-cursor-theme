/**
 * dsh-cursor-theme client entry — aligned with deepseek-harness-desktop
 * plugin conventions (see dsh-community-market's client entry).
 *
 * Loaded by the DSH web client through `dsh.client.inject` in package.json;
 * the host wraps this module in `window.__ModuleLoader__.load({ id, factory })`
 * (see scripts/build-client.mjs).
 *
 * Desktop-aligned wiring:
 *   1. Module-level `inject: ["slots", "locale"]` — the same declaration
 *      shape as the official in-product market (dsh-community-market).
 *   2. Style tag + settings-driven rendering (M1 behavior preserved);
 *      settingsScope and theme are injected NESTED so the bundle still
 *      mounts on hosts without those services (style injection keeps
 *      working, the UI simply stays absent there).
 *   3. Register a `settings.plugins.tab` page (设置 → 插件 → 光标主题),
 *      matching the canonical plugin-settings surface used by Desktop.
 */

import { applyCursorCss } from './style.js'
import { CursorThemeSection, type CardScope } from './section.js'
import { en, zh } from './locales.js'
import { applyColorScheme, type ColorScheme } from './follow.js'
import type { CursorThemeSettings } from './types.js'

/** Bundle-layer identity, matching cordis.patch.yml's `id`. */
export const name = 'dsh-cursor-theme'

/**
 * Host services this client bundle requires at mount — same shape as the
 * official dsh-community-market client. slots + locale are guaranteed on
 * every web composition; settingsScope/theme stay nested (rc.7+).
 */
export const inject: string[] = ['slots', 'locale']

/** Structural subset of the client-side Cordis context this bundle touches. */
interface ClientContext {
  effect(callback: () => unknown, label?: string): void
  inject(services: string[], callback: (scoped: unknown) => void): void
  on?(event: string, callback: () => void): () => void
  slots: SlotsService
  locale: LocaleService
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

/** Structural subset of the conversation service (dsh-client-ui-conversation). */
interface ConversationService {
  send(text: string): Promise<void>
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

  // 1) Style tag (dedupe across HMR re-composition).
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

  // 2) Settings-driven rendering (M1) + light/dark follow (M3d).
  //    Nested: only runs when the host actually provides settingsScope.
  ctx.inject(['settingsScope'], (scoped) => {
    const scope = (scoped as { settingsScope: SettingsScope }).settingsScope.bind({ namespace: NS })
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

  // 3) Settings UI (M2) + AI generator (M4). Official surface:
  //    settings.plugins.tab. conversation is optional (nested inject).
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-cursor-theme: dictionaries')

  ctx.inject(['settingsScope'], (scoped) => {
    const scope = (scoped as { settingsScope: SettingsScope }).settingsScope.bind({ namespace: NS })
    ctx.inject(['conversation'], (scopedC) => {
      const conversation = (scopedC as { conversation: ConversationService }).conversation
      ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'cursor-theme',
        order: 30,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ scope, t, conversation }),
      }, CursorThemeSection as unknown as (props: Record<string, unknown>) => unknown))
    })
  })
}
