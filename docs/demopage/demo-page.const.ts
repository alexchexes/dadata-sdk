import { SUGGEST_TYPES } from '@dadata-sdk/api-types';
import type { SuggestType } from '@dadata-sdk/api-types';
import type { VueDadataOptions } from '@dadata-sdk/vue';

export const SUGGEST_TYPES_ORDER: SuggestType[] = [
  'address',
  'fias',
  'party',
  'party_by',
  'party_kz',
  'bank',
  'fio',
  'email',
  'fms_unit',
  'postal_unit',
  'fns_unit',
  'fts_unit',
  'court',
  'metro',
  'car_brand',
  'mktu',
  'country',
  'currency',
  'okved2',
  'okpd2',
  'oktmo',
];

export const ORDERED_SUGGEST_TYPES: SuggestType[] = [
  ...SUGGEST_TYPES_ORDER,
  ...SUGGEST_TYPES.filter((item) => !SUGGEST_TYPES_ORDER.includes(item)),
];

export const API_OPTIONS_KEYS: (keyof VueDadataOptions)[] = [
  'count',
  'fromBound',
  'toBound',
  'locationsFilter',
  'restrictValue',
  'locationsBoost',
  'division',
  'radiusFilter',
  'language',
  'entityType',
  'entityStatus',
  'branchType',
  'okved',
  'fioParts',
  'fioGender',
];

export const BEHAVIOR_OPTIONS_KEYS: (keyof VueDadataOptions)[] = [
  'debounce',
  'minChars',
  'disabled',
  'placeholder',
  'inputName',
  'inputAttributes',
  'suggestionsHint',
  'noSuggestionsHint',
  'classes',
  'showOnFocus',
  'selectOnBlur',
  'selectOnEnter',
  'enrichOnSelect',
  'clearOnChange',
  'addSpace',
  'continueSelecting',
  'showClearButton',
  'focusOnMounted',
  'forceShow',
  'forceHide',
];

export const SUGGEST_TYPES_WITH_LOCATIONS: SuggestType[] = ['address', 'fias', 'party', 'bank'];
export const SUGGEST_TYPES_WITH_LOCATION_EXAMPLES: SuggestType[] = ['address', 'fias'];
export const SUGGEST_TYPES_WITH_BOUNDS: SuggestType[] = ['address', 'fias'];
export const SUGGEST_TYPES_WITH_RESTRICT_VALUE: SuggestType[] = ['address', 'fias'];
export const SUGGEST_TYPES_WITH_ENTITY_STATUS: SuggestType[] = ['party', 'party_by', 'bank'];
export const JSON_FILTER_SUGGEST_TYPES: SuggestType[] = [
  'fms_unit',
  'fns_unit',
  'metro',
  'mktu',
  'okpd2',
  'okved2',
  'postal_unit',
  'court',
];
