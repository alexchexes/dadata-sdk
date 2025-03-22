import type { BoundType, DivisionType, Language, LocationRestriction, RadiusFilter } from './api';

/**
 * User-facing type for locationsBoost (`locations_boost` in API) prop.
 * A single kladr_id or an array of kladr_id's.
 */
export type LocationsBoost = string | number | (string | number)[];

/**
 * Vue-dadata internal parameters for each query
 */
export interface SuggestAddressOptions {
  token: string;
  url?: string;
  httpCache?: boolean;
  query: string;
  count?: number;
  division?: DivisionType;
  fromBound?: BoundType;
  toBound?: BoundType;
  locationsFilter?: LocationRestriction | LocationRestriction[];
  radiusFilter?: RadiusFilter;
  restrictValue?: Boolean;
  locationsBoost?: LocationsBoost;
  language?: Language;
}
