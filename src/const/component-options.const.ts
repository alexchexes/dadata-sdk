import type { InternalVueDadataOptions } from '@/types';
import { DEFAULT_COUNT, DEFAULT_DIVISION, DEFAULT_LANGUAGE } from './api';
export const SHOW_ON_FOCUS_OPTIONS = ['no_selection', 'always', false] as const;

export const DEFAULT_CLASSES = {
  /** Top-level container */
  container: 'vue-dadata',

  /** Wrapper around input, button, and inputOverlay slot */
  inputWrapper: 'vue-dadata__input-wrapper',

  /** Input element */
  input: 'vue-dadata__input',

  /** Dropdown list of suggestions */
  dropdown: 'vue-dadata__dropdown',

  /** Individual suggestion item */
  suggestionItem: 'vue-dadata__suggestion',

  /** Currently navigated (with keyboard) suggestion item */
  navigatedSuggestionItem: 'vue-dadata__suggestion--navigated',

  /** Matching text inside suggestion item */
  highlightedText: 'vue-dadata__highlighted-text',

  /** Clear button inside input */
  clearButton: 'vue-dadata__clear-button',
} as const;

export const DEFAULT_OPTIONS = {
  inputName: 'vue-dadata-input',
  placeholder: '',
  disabled: false,
  selectOnBlur: false,
  selectOnEnter: true,
  enrichOnSelect: true,
  showOnFocus: 'no_selection',
  clearOnChange: true,
  addSpace: true,
  continueSelecting: false,
  showClearButton: false,
  debounce: 100,
  suggestType: 'address',
  language: DEFAULT_LANGUAGE,
  division: DEFAULT_DIVISION,
  count: DEFAULT_COUNT,
  httpCache: true,
  restrictValue: false,
  minChars: 1,
  forceShow: false,
} as const satisfies Omit<InternalVueDadataOptions, 'token'>;
