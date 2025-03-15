import type { LocationOptions, LocationsBoost } from '../types';
import type { BoundsType, DadataAddress } from './address.types';

/**
 * Vue-dadata internal parameters for each query
 */
export interface AddressSuggestionsParams {
  token: string;
  query: string;
  url?: string;
  count?: number;
  toBound?: BoundsType;
  fromBound?: BoundsType;
  locationOptions?: LocationOptions;
  locationsBoost?: LocationsBoost;
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
  to_bound?: { value: BoundsType };
  from_bound?: { value: BoundsType };
  language?: string;
  locations?: object[];
  locations_boost?: LocationsBoostItem | LocationsBoostItem[];
}

/**
 * Type of a single address suggestion returned from API and exposed to the user
 */
export interface AddressSuggestion {
  value: string;
  unrestricted_value: string;
  data: DadataAddress;
}
