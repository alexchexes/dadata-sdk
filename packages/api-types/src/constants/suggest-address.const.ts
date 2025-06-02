/** Default value for `locations_geo.radius_meters` filter of the `suggest/address` Dadata API */
export const DEFAULT_GEO_RADIUS = 100;
/** Maximum value for `locations_geo.radius_meters` filter of the `suggest/address` Dadata API */
export const MAX_GEO_RADIUS = 100000;

/** List of divisions, supported by Dadata suggest/address API. Default `ADMINISTRATIVE` */
export const DIVISION_TYPES = ['ADMINISTRATIVE', 'MUNICIPAL'] as const;
/** Default division in which Dadata returns data in the suggest/address API */
export const DEFAULT_DIVISION = 'ADMINISTRATIVE';

/** List of languages, supported by various Dadata APIs, e.g. suggest/address. Default `RU` */
export const LANGUAGES = ['RU', 'EN'] as const;
/** Default language in which Dadata returns data */
export const DEFAULT_LANGUAGE = 'RU';

/** Available bounds for `from_bound`/`to_bound` options of the `suggest/address` and `suggest/fias` APIs */
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
