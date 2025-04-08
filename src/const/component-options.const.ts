import type { InternalVueDadataOptions, OnlyPrimitives } from '@/types';
import { DEFAULT_COUNT, DEFAULT_DIVISION, DEFAULT_LANGUAGE } from './api';
import type { SuggestType } from '@/types/api';
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

  /** Hint inside the dropdown */
  hint: 'vue-dadata__dropdown-hint',

  /** Individual suggestion item */
  suggestionItem: 'vue-dadata__suggestion',

  /** Suggestion title (main text, `value`) */
  suggestionTitle: 'vue-dadata__suggestion-title',

  /** Suggestion subtitle (shown in certain cases like when address historical data available or for organization/banks) */
  suggestionSubtitle: 'vue-dadata__suggestion-subtitle',

  /** Currently navigated (with keyboard) suggestion item */
  navigatedSuggestionItem: 'vue-dadata__suggestion--navigated',

  /** Strike-through text (liquidated organizations, banks, etc.) */
  strikethroughText: 'vue-dadata__strikethrough-text',

  /** Matching text inside suggestion item */
  highlightedText: 'vue-dadata__highlighted-text',

  /** Clear button inside input */
  clearButton: 'vue-dadata__clear-button',
} as const;

export const DEFAULT_TYPE = 'address';

/** We spread this in `withDefaults` so no array or objects are allowed */
export const DEFAULT_OPTIONS = {
  clearOnChange: true,
  selectOnEnter: true,
  enrichOnSelect: true,
  httpCache: true,
  suggestionsHint: 'Выберите вариант или продолжите ввод',
  inputName: 'vue-dadata-input',
  placeholder: '',
  showOnFocus: 'no_selection',
  debounce: 100,
  suggestType: DEFAULT_TYPE,
  language: DEFAULT_LANGUAGE,
  division: DEFAULT_DIVISION,
  count: DEFAULT_COUNT,
  minChars: 1,
} as const satisfies Omit<InternalVueDadataOptions, 'token'> satisfies OnlyPrimitives;

export const NO_SUGGESTIONS_HINTS = {
  address: 'Неизвестный адрес',
  fias: 'Неизвестный адрес',
  party: 'Неизвестная организация',
  party_by: 'Неизвестная организация',
  party_kz: 'Неизвестная организация',
  bank: 'Неизвестный банк',
} as const satisfies Partial<Record<SuggestType, string | false>>;
