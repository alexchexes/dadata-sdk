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
  'planning_structure', // not documented for suggestions (only for FIAS) but works
  'street',
  'house',
  'flat',
] as const;
