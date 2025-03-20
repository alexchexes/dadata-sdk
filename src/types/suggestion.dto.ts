import type { LocationRestriction, LocationsBoost } from '../types';
import type { BoundsType, DadataAddress } from './address.types';

/**
 * Vue-dadata internal parameters for each query
 */
export interface AddressSuggestionsParams {
  token: string;
  url?: string;
  httpCache?: boolean;
  query: string;
  count?: number;
  fromBound?: BoundsType;
  toBound?: BoundsType;
  locationsFilter?: LocationRestriction | LocationRestriction[];
  radiusFilter?: RadiusFilter;
  restrictValue?: Boolean;
  locationsBoost?: LocationsBoost;
  language?: string;
}

export interface RadiusFilter {
  lat: string;
  lon: string;
  radius_meters: number;
}

/**
 * API-facing type for a `locations_boost` item
 */
export interface LocationsBoostItem {
  kladr_id: string;
}

/**
 * Actual 'low-level' API payload type
 */
export interface AddressSuggestionsPayload {
  query: string;
  count?: number;
  from_bound?: { value: BoundsType };
  to_bound?: { value: BoundsType };
  locations?: LocationRestriction[];
  locations_geo?: [RadiusFilter];
  locations_boost?: LocationsBoostItem | LocationsBoostItem[];
  restrict_value?: Boolean;
  language?: string;
}

/**
 * Type of a single address suggestion returned from API and exposed to the user
 */
export interface AddressSuggestion {
  value: string;
  unrestricted_value: string;
  data: DadataAddress;
}
