import type { VueDadataProps } from '@/VueDadata.vue';
import { DEFAULT_COUNT, DEFAULT_DIVISION, DEFAULT_LANGUAGE, DEFAULT_SUGGEST_TYPE } from './api';

export const SHOW_ON_FOCUS_OPTIONS = ['no_selection', 'always', false] as const;
export const DEFAULT_SHOW_ON_FOCUS = 'no_selection';
export const DEFAULT_INPUT_NAME = 'vue-dadata-input';
export const DEFAULT_DEBOUNCE = 100;

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
  placeholder: '',
  url: undefined,
  httpCache: true,
  debounceWait: DEFAULT_DEBOUNCE,
  disabled: false,
  suggestType: DEFAULT_SUGGEST_TYPE,
  division: DEFAULT_DIVISION,
  fromBound: undefined,
  toBound: undefined,
  inputName: DEFAULT_INPUT_NAME,
  locationsFilter: undefined,
  radiusFilter: undefined,
  restrictValue: false,
  locationsBoost: undefined,
  language: DEFAULT_LANGUAGE,
  classes: undefined,
  showOnFocus: DEFAULT_SHOW_ON_FOCUS,
  selectOnBlur: false,
  selectOnEnter: true,
  count: DEFAULT_COUNT,
  enrichOnSelect: true,
  clearOnChange: true,
  addSpace: true,
  continueSelecting: false,
  showClearButton: false,
  inputAttributes: undefined,
  partyType: undefined,
  bankType: undefined,
  entityStatus: undefined,
  okved: undefined,
  fioParts: undefined,
  fioGender: undefined,
} as const satisfies Omit<VueDadataProps, 'token'>;

DEFAULT_OPTIONS;
