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
}

export const CURSOR_STATES: CursorStateDef[] = [
  {
    id: 'default',
    label: 'Default',
    selectors: ['body'],
    fallback: 'default',
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
  },
  {
    id: 'wait',
    label: 'Wait (busy)',
    selectors: ['[data-cursor-state="wait"]', '.dsh-cursor-wait'],
    fallback: 'wait',
  },
  {
    id: 'help',
    label: 'Help',
    selectors: ['[data-cursor-state="help"]'],
    fallback: 'help',
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
  },
  {
    id: 'grab',
    label: 'Grab (drag handle)',
    selectors: ['[data-cursor-state="grab"]', '.dsh-cursor-grab'],
    fallback: 'grab',
  },
  {
    id: 'grabbing',
    label: 'Grabbing (dragging)',
    selectors: ['[data-cursor-state="grabbing"]', '.dsh-cursor-grabbing'],
    fallback: 'grabbing',
  },
  {
    id: 'progress',
    label: 'Progress (busy but interactive)',
    selectors: ['[data-cursor-state="progress"]'],
    fallback: 'progress',
  },
  {
    id: 'cell',
    label: 'Cell (table)',
    selectors: ['td', 'th', '[role="gridcell"]'],
    fallback: 'cell',
  },
  {
    id: 'copy',
    label: 'Copy',
    selectors: ['[data-cursor-state="copy"]'],
    fallback: 'copy',
  },
  {
    id: 'move',
    label: 'Move',
    selectors: ['[data-cursor-state="move"]'],
    fallback: 'move',
  },
  {
    id: 'resize-ew',
    label: 'Resize east-west',
    selectors: ['[data-cursor-state="resize-ew"]'],
    fallback: 'ew-resize',
  },
  {
    id: 'resize-ns',
    label: 'Resize north-south',
    selectors: ['[data-cursor-state="resize-ns"]'],
    fallback: 'ns-resize',
  },
]

/** Convenience lookup by state id. */
export const CURSOR_STATE_BY_ID: ReadonlyMap<string, CursorStateDef> = new Map(
  CURSOR_STATES.map((s) => [s.id, s]),
)
