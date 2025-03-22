export const SUGGEST_ADDRESS_URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

export const DEFAULT_COUNT = 10;
export const MAX_SUG_COUNT = 20;

export const DEFAULT_GEO_RADIUS = 100;
export const MAX_GEO_RADIUS = 100000;

export const DIVISION_TYPES = ['ADMINISTRATIVE', 'MUNICIPAL'] as const;
export const DEFAULT_DIVISION = 'ADMINISTRATIVE';

export const LANGUAGES = ['ru', 'en'] as const;
export const DEFAULT_LANGUAGE = 'ru';

export const BOUND_TYPES = [
  'country',
  'region',
  'area',
  'city',
  'settlement',
  'street',
  'house',
  'flat',
] as const;
