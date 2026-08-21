/**
 * dsh-cursor-theme client entry — aligned with deepseek-harness-desktop
 * plugin conventions (see dsh-community-market's client entry).
 *
 * Loaded by the DSH web client through `dsh.client.inject` in package.json;
 * the host wraps this module in `window.__ModuleLoader__.load({ id, factory })`
 * (see scripts/build-client.mjs).
 *
 * Wiring:
 *   1. Module-level `inject: ["slots", "locale"]` — same shape as the
 *      official in-product market.
 *   2. Style tag + settings-driven rendering (settingsScope nested so the
 *      bundle still mounts without that service).
 *   3. Register a top-level `settings.section` page (设置 → 光标主题).
 */

import { applyCursorCss } from './style.js'
import { CursorThemeSection, type CardScope } from './section.js'
import { en, zh } from './locales.js'
import type { CursorThemeSettings } from './types.js'

/** Bundle-layer identity, matching cordis.patch.yml's `id`. */
export const name = 'dsh-cursor-theme'

/**
 * Host services this client bundle requires at mount — same shape as the
 * official dsh-community-market client.
 */
export const inject: string[] = ['slots', 'locale']

/** Structural subset of the client-side Cordis context this bundle touches. */
interface ClientContext {
  effect(callback: () => unknown, label?: string): void
  inject(services: string[], callback: (scoped: unknown) => void): void
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

/** Defaults when the settings service is absent or the value is empty. */
const DEFAULT_SETTINGS: CursorThemeSettings = {
  enabled: true,
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

  // 2) Settings-driven rendering. Nested: only runs when the host provides
  //    settingsScope; without it the style tag stays empty (system cursors).
  ctx.inject(['settingsScope'], (scoped) => {
    const scope = (scoped as { settingsScope: SettingsScope }).settingsScope.bind({ namespace: NS })
    const render = () => {
      if (!tag) return
      const snapshot = scope.getSnapshot()
      const settings = snapshot.status === 'ready' && snapshot.value
        ? snapshot.value
        : DEFAULT_SETTINGS
      applyCursorCss(tag, settings)
    }
    scope.subscribe(render)
    render()
  })

  // 3) Settings UI — top-level 设置 → 光标主题, positioned AFTER 插件
  //    (plugins order=15; agent-presets=20), so order 25 places it at the
  //    end of the settings nav list.
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-cursor-theme: dictionaries')

  ctx.inject(['settingsScope'], (scoped) => {
    const scope = (scoped as { settingsScope: SettingsScope }).settingsScope.bind({ namespace: NS })
    ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section',
      id: 'cursor-theme',
      order: 25,
      label: () => t('nav'),
      locale: NS,
      inject: () => ({ scope, t }),
    }, CursorThemeSection as unknown as (props: Record<string, unknown>) => unknown))
  })
}
