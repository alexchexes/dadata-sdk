// Locations restrictions.
// Split by category for our own convenience, while in the API there's no such thing as location restriction category.
export const ISO_CODE_RESTRICTION_TYPES = ['country_iso_code', 'region_iso_code'] as const;

export const KLADR_ID_RESTRICTION_TYPES = ['kladr_id'] as const;

export const FIAS_ID_RESTRICTION_TYPES = [
  'fias_id',
  'region_fias_id',
  'area_fias_id',
  'city_fias_id',
  'settlement_fias_id',
  'street_fias_id',
] as const;

export const NAME_RESTRICTION_TYPES = [
  'country',
  'region',
  'area',
  'city',
  'settlement',
  'street',
] as const;

export const TYPE_FULL_RESTRICTION_TYPES = [
  'region_type_full',
  'area_type_full',
  'city_type_full',
  'settlement_type_full',
  'street_type_full',
] as const;

// Flat union of all above
export const RESTRICTION_TYPES = [
  ...ISO_CODE_RESTRICTION_TYPES,
  ...KLADR_ID_RESTRICTION_TYPES,
  ...FIAS_ID_RESTRICTION_TYPES,
  ...NAME_RESTRICTION_TYPES,
  ...TYPE_FULL_RESTRICTION_TYPES,
] as const;
