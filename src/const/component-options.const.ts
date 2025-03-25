import type { HighlightOptions } from '@/types';

export const SHOW_ON_FOCUS_OPTIONS = ['no_selection', 'always', false] as const;
export const DEFAULT_SHOW_ON_FOCUS = 'no_selection';

export const DEFAULT_HIGHLIGHT_OPTIONS: Required<HighlightOptions> = {
  caseSensitive: false,
  splitBySpace: true,
  highlightTag: 'mark',
  highlightClass: '',
  highlightStyle: '',
  wrapperTag: 'button',
  wrapperClass: '',
} as const;

// the source of truth - this constant defines the type
export const DEFAULT_CLASSES = {
  /** The very top level container */
  container: 'vue-dadata vue-dadata__container',
  /** The wrapper inside the container, that wraps input, button, and an inputOverlay slot */
  inputWrapper: 'vue-dadata__input-wrapper',
  /** Input element */
  input: 'vue-dadata__input',
  /** Dropdown with suggestions, parent of each suggestion item */
  suggestions: 'vue-dadata__suggestions_container',
  /** One suggestion item, child of the 'suggestions' dropdown */
  suggestionItem: 'vue-dadata__suggestion',
  /** Currently selected (with the keyboard) suggestion item */
  suggestionCurrentItem: 'vue-dadata__suggestion--current',
  /** Words/letters that match user query */
  suggestionTextHighlight: 'vue-dadata--highlighted-text',
  /** Clear button (absulutely positioned) element */
  clearButton: 'vue-dadata--clear-button',
} as const;
