export const LOCATION_RESTRICTION_CATEGORIES = {
  byName: ['country', 'region', 'area', 'city', 'settlement', 'street'] as const,
  byFullType: [
    'region_type_full',
    'area_type_full',
    'city_type_full',
    'settlement_type_full',
    'street_type_full',
  ] as const,
  byFiasId: [
    'fias_id',
    'region_fias_id',
    'area_fias_id',
    'city_fias_id',
    'settlement_fias_id',
    'street_fias_id',
  ] as const,
  byKladrId: ['kladr_id'] as const,
  byIsoCode: ['country_iso_code', 'region_iso_code'] as const,
} as const;

export const LOCATION_RESTRICTION_KEYS = [
  ...LOCATION_RESTRICTION_CATEGORIES.byIsoCode,
  ...LOCATION_RESTRICTION_CATEGORIES.byKladrId,
  ...LOCATION_RESTRICTION_CATEGORIES.byFiasId,
  ...LOCATION_RESTRICTION_CATEGORIES.byName,
  ...LOCATION_RESTRICTION_CATEGORIES.byFullType,
] as const;
