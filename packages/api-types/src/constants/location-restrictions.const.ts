// Locations restrictions.
// Split by category for our own convenience, while in the API there's no such thing as location restriction category.
import type { LocationRestriction } from '../types';

type LocationRestrictionKey = (keyof LocationRestriction)[];

export const ISO_CODE_RESTRICTION_TYPES = [
  'country_iso_code', // * to allow dadata search any country
  'region_iso_code', //
] as const satisfies LocationRestrictionKey;

export const KLADR_ID_RESTRICTION_TYPES = [
  'kladr_id', // any level of kladr is supported: 63, 63000007, 6300000100000
] as const satisfies LocationRestrictionKey;

export const FIAS_ID_RESTRICTION_TYPES = [
  'fias_id',
  'region_fias_id',
  'area_fias_id',
  'city_fias_id',
  'settlement_fias_id',
  'planning_structure_fias_id', // not documented for suggestions (only for FIAS) but works
  'street_fias_id',
] as const satisfies LocationRestrictionKey;

export const NAME_RESTRICTION_TYPES = [
  'country', // * to allow dadata search any country
  'region',
  'area',
  'city',
  'settlement',
  'planning_structure', // not documented for suggestions (only for FIAS) but works
  'street',
] as const satisfies LocationRestrictionKey;

export const TYPE_FULL_RESTRICTION_TYPES = [
  'region_type_full',
  'area_type_full',
  'city_type_full',
  'settlement_type_full',
  'planning_structure_type_full', // not documented for suggestions (only for FIAS) but works
  'street_type_full',
] as const satisfies LocationRestrictionKey;

// Flat union of all above
export const RESTRICTION_TYPES = [
  ...ISO_CODE_RESTRICTION_TYPES,
  ...KLADR_ID_RESTRICTION_TYPES,
  ...FIAS_ID_RESTRICTION_TYPES,
  ...NAME_RESTRICTION_TYPES,
  ...TYPE_FULL_RESTRICTION_TYPES,
] as const satisfies LocationRestrictionKey;
