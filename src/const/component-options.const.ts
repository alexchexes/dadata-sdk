import type { InternalVueDadataOptions } from '@/types';
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

  /** Currently navigated (with keyboard) suggestion item */
  navigatedSuggestionItem: 'vue-dadata__suggestion--navigated',

  /** Matching text inside suggestion item */
  highlightedText: 'vue-dadata__highlighted-text',

  /** Clear button inside input */
  clearButton: 'vue-dadata__clear-button',
} as const;

export const DEFAULT_TYPE = 'address';

// define boolean true props separately so we can use it with `withDefaults`
export const DEFAULT_BOOL_TRUE_OPTIONS = {
  clearOnChange: true,
  selectOnEnter: true,
  enrichOnSelect: true,
  addSpace: true,
  httpCache: true,
} as const satisfies Partial<InternalVueDadataOptions>;

export const DEFAULT_OPTIONS = {
  ...DEFAULT_BOOL_TRUE_OPTIONS,
  inputName: 'vue-dadata-input',
  placeholder: '',
  disabled: false,
  selectOnBlur: false,
  showOnFocus: 'no_selection',
  continueSelecting: false,
  showClearButton: false,
  debounce: 100,
  suggestType: DEFAULT_TYPE,
  language: DEFAULT_LANGUAGE,
  division: DEFAULT_DIVISION,
  count: DEFAULT_COUNT,
  restrictValue: false,
  minChars: 1,
  suggestionsHint: 'Выберите вариант или продолжите ввод',
  forceShow: false,
  forceHide: false,
} as const satisfies Omit<InternalVueDadataOptions, 'token'>;

export const NO_SUGGESTIONS_HINTS = {
  address: 'Неизвестный адрес',
  fias: 'Неизвестный адрес',
  party: 'Неизвестная организация',
  party_by: 'Неизвестная организация',
  party_kz: 'Неизвестная организация',
  bank: 'Неизвестный банк',
} as const satisfies Partial<Record<SuggestType, string | false>>;
