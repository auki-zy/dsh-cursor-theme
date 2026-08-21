/**
 * dsh-cursor-theme client state model.
 *
 * Maps each user-facing UI state to the CSS selector(s) whose `cursor`
 * should be overridden, plus the fallback keyword to append when the user
 * has not (yet) provided an image for that state. This table is the single
 * source of truth for both the settings UI (M2) and the style generator.
 *
 * Selector design notes:
 * - Broad element selectors (`a, button`) are intentional: they match the
 *   interactive surfaces DSH's UI kit builds on. More specific component
 *   hooks can be added later without breaking the model.
 * - `[disabled]`, `[aria-disabled="true"]` cover disabled controls; note
 *   `:disabled` would only match form elements, and DSH buttons often set
 *   the attribute instead.
 * - `[contenteditable="true"]` covers the composer's rich-text surfaces.
 * - The fallback keyword is ALWAYS appended by the generator
 *   (`cursor: url(...) x y, <fallback>;`), per the accessibility NFR: a
 *   failed/oversized image must degrade to a usable cursor, never `none`.
 */

export interface CursorStateDef {
  /** Stable id — also the key under settings `states`. */
  id: string
  /** Human label key (i18n in M2; English fallback today). */
  label: string
  /** CSS selectors whose cursor this state drives. */
  selectors: string[]
  /** Default CSS cursor keyword when no custom image applies. */
  fallback: string
  /**
   * SVG icon approximating the SYSTEM default cursor for this state —
   * shown in the list so the user knows exactly which cursor they are
   * replacing (neutral gray, not the custom art).
   */
  defaultIcon: string
}

/**
 * Neutral gray system-like cursor icons (32×32 viewBox). These are meant to
 * look like the OS defaults, so users recognize what each state controls.
 */
const GRAY = '#8a8f98'

const SVG = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${body}</svg>`

const ICONS: Record<string, string> = {
  default: SVG(`<path d="M6 3 L22 13 L14.5 14 L17.5 24 L13.5 25 L10.5 15.5 L6.5 18 Z" fill="${GRAY}"/>`),
  pointer: SVG(`<path d="M7 3 L24 15 L15.5 16 L19 25 L15.5 26 L12 17.5 L8 20 Z" fill="${GRAY}"/>`),
  text: SVG(`<rect x="12" y="3" width="8" height="3" rx="1" fill="${GRAY}"/><rect x="12" y="26" width="8" height="3" rx="1" fill="${GRAY}"/><rect x="15" y="5" width="2" height="22" fill="${GRAY}"/>`),
  wait: SVG(`<circle cx="16" cy="16" r="10" fill="none" stroke="${GRAY}" stroke-width="4" stroke-dasharray="40 22" stroke-linecap="round"/>`),
  help: SVG(`<circle cx="16" cy="16" r="11" fill="none" stroke="${GRAY}" stroke-width="3"/><text x="16" y="22" text-anchor="middle" font-size="17" font-weight="700" fill="${GRAY}" font-family="sans-serif">?</text>`),
  'not-allowed': SVG(`<circle cx="16" cy="16" r="11" fill="none" stroke="${GRAY}" stroke-width="3"/><rect x="8" y="14.5" width="16" height="3" rx="1.5" transform="rotate(45 16 16)" fill="${GRAY}"/>`),
  grab: SVG(`<circle cx="16" cy="16" r="9" fill="${GRAY}"/><circle cx="16" cy="16" r="3" fill="#fff"/>`),
  grabbing: SVG(`<circle cx="16" cy="16" r="9" fill="${GRAY}"/><circle cx="16" cy="16" r="3.5" fill="#fff"/><path d="M8 8 L10 10" stroke="${GRAY}" stroke-width="2"/>`),
  progress: SVG(`<circle cx="16" cy="16" r="10" fill="none" stroke="${GRAY}" stroke-width="4" stroke-dasharray="30 30" stroke-linecap="round"/>`),
  cell: SVG(`<rect x="9" y="9" width="14" height="14" rx="2" fill="none" stroke="${GRAY}" stroke-width="2"/><path d="M9 16 L23 16 M16 9 L16 23" stroke="${GRAY}" stroke-width="1"/>`),
  copy: SVG(`<rect x="6" y="6" width="13" height="13" rx="2" fill="${GRAY}"/><rect x="13" y="13" width="13" height="13" rx="2" fill="none" stroke="${GRAY}" stroke-width="2.5"/>`),
  move: SVG(`<path d="M16 4 L19 10 L13 10 Z M16 28 L19 22 L13 22 Z M4 16 L10 13 L10 19 Z M28 16 L22 13 L22 19 Z" fill="${GRAY}"/><circle cx="16" cy="16" r="3" fill="${GRAY}"/>`),
  'resize-ew': SVG(`<path d="M4 16 L10 11 L10 21 Z M28 16 L22 11 L22 21 Z" fill="${GRAY}"/>`),
  'resize-ns': SVG(`<path d="M16 4 L11 10 L21 10 Z M16 28 L11 22 L21 22 Z" fill="${GRAY}"/>`),
}

export const CURSOR_STATES: CursorStateDef[] = [
  {
    id: 'default',
    label: 'Default',
    selectors: ['body'],
    fallback: 'default',
    defaultIcon: ICONS.default,
  },
  {
    id: 'pointer',
    label: 'Pointer (links & buttons)',
    selectors: [
      'a',
      'button',
      '[role="button"]',
      '[role="link"]',
      'summary',
      'select',
      'label[for]',
    ],
    fallback: 'pointer',
    defaultIcon: ICONS.pointer,
  },
  {
    id: 'text',
    label: 'Text (inputs)',
    selectors: [
      'input',
      'textarea',
      '[contenteditable="true"]',
      '[role="textbox"]',
    ],
    fallback: 'text',
    defaultIcon: ICONS.text,
  },
  {
    id: 'wait',
    label: 'Wait (busy)',
    selectors: ['[data-cursor-state="wait"]', '.dsh-cursor-wait'],
    fallback: 'wait',
    defaultIcon: ICONS.wait,
  },
  {
    id: 'help',
    label: 'Help',
    selectors: ['[data-cursor-state="help"]'],
    fallback: 'help',
    defaultIcon: ICONS.help,
  },
  {
    id: 'not-allowed',
    label: 'Not allowed',
    selectors: [
      '[disabled]',
      '[aria-disabled="true"]',
      '[data-cursor-state="not-allowed"]',
    ],
    fallback: 'not-allowed',
    defaultIcon: ICONS['not-allowed'],
  },
  {
    id: 'grab',
    label: 'Grab (drag handle)',
    selectors: ['[data-cursor-state="grab"]', '.dsh-cursor-grab'],
    fallback: 'grab',
    defaultIcon: ICONS.grab,
  },
  {
    id: 'grabbing',
    label: 'Grabbing (dragging)',
    selectors: ['[data-cursor-state="grabbing"]', '.dsh-cursor-grabbing'],
    fallback: 'grabbing',
    defaultIcon: ICONS.grabbing,
  },
  {
    id: 'progress',
    label: 'Progress (busy but interactive)',
    selectors: ['[data-cursor-state="progress"]'],
    fallback: 'progress',
    defaultIcon: ICONS.progress,
  },
  {
    id: 'cell',
    label: 'Cell (table)',
    selectors: ['td', 'th', '[role="gridcell"]'],
    fallback: 'cell',
    defaultIcon: ICONS.cell,
  },
  {
    id: 'copy',
    label: 'Copy',
    selectors: ['[data-cursor-state="copy"]'],
    fallback: 'copy',
    defaultIcon: ICONS.copy,
  },
  {
    id: 'move',
    label: 'Move',
    selectors: ['[data-cursor-state="move"]'],
    fallback: 'move',
    defaultIcon: ICONS.move,
  },
  {
    id: 'resize-ew',
    label: 'Resize east-west',
    selectors: ['[data-cursor-state="resize-ew"]'],
    fallback: 'ew-resize',
    defaultIcon: ICONS['resize-ew'],
  },
  {
    id: 'resize-ns',
    label: 'Resize north-south',
    selectors: ['[data-cursor-state="resize-ns"]'],
    fallback: 'ns-resize',
    defaultIcon: ICONS['resize-ns'],
  },
]

/** Convenience lookup by state id. */
export const CURSOR_STATE_BY_ID: ReadonlyMap<string, CursorStateDef> = new Map(
  CURSOR_STATES.map((s) => [s.id, s]),
)
