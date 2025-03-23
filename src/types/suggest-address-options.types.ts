import type {
  BoundType,
  BoundTypeFias,
  DivisionType,
  Language,
  LocationRestriction,
  LocationRestrictionFias,
  RadiusFilter,
  SuggestType,
} from './api';

/**
 * User-facing type for locationsBoost (`locations_boost` in API) prop.
 * A single kladr_id or an array of kladr_id's.
 */
export type LocationsBoost = string | number | (string | number)[];

export interface BaseSuggestOptions {
  token: string;
  url?: string;
  httpCache?: boolean;
  query: string;
  count?: number;
  suggestType?: SuggestType;
}

/**
 * Options common for FIAS and normal type of address suggestions
 */
interface SuggestAddressOptionsCommon extends BaseSuggestOptions {
  locationsBoost?: LocationsBoost;
  restrictValue?: Boolean;
}

/**
 * Normal address suggestions options
 */
export interface SuggestAddressOptions extends SuggestAddressOptionsCommon {
  division?: DivisionType;
  fromBound?: BoundType;
  toBound?: BoundType;
  locationsFilter?: LocationRestriction | LocationRestriction[];
  radiusFilter?: RadiusFilter;
  restrictValue?: Boolean;
  locationsBoost?: LocationsBoost;
  language?: Language;
}

/**
 * FIAS address suggestions options
 */
export interface SuggestFiasOptions extends SuggestAddressOptionsCommon {
  fromBound?: BoundTypeFias;
  toBound?: BoundTypeFias;
  locationsFilter?: LocationRestrictionFias | LocationRestrictionFias[];
}
