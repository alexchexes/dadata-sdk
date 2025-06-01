import type { BOUND_TYPES } from '../../constants';

export interface LocationRestriction {
  country_iso_code?: string;
  region_iso_code?: string;

  country?: string;

  region?: string;
  area?: string;
  city?: string;
  settlement?: string;
  street?: string;
  planning_structure?: string;

  region_type_full?: string;
  area_type_full?: string;
  city_type_full?: string;
  settlement_type_full?: string;
  street_type_full?: string;
  planning_structure_type_full?: string;

  kladr_id?: string;

  fias_id?: string;
  region_fias_id?: string;
  area_fias_id?: string;
  city_fias_id?: string;
  settlement_fias_id?: string;
  street_fias_id?: string;
  planning_structure_fias_id?: string;
}

export type BoundType = (typeof BOUND_TYPES)[number];

export interface KladrIdFilter {
  kladr_id?: string;
}

export interface BaseSuggestPayload {
  /**
   * Query string
   * @maxLength 300
   */
  query: string;
  /**
   * Maximum number of results to fetch
   * @minimum 1
   * @maximum 20
   */
  count?: number;
}

export interface SuggestCarBrandPayload extends BaseSuggestPayload {}
export interface SuggestCountryPayload extends BaseSuggestPayload {}
export interface SuggestCurrencyPayload extends BaseSuggestPayload {}
export interface SuggestEmailPayload extends BaseSuggestPayload {}
export interface SuggestFtsUnitPayload extends BaseSuggestPayload {}
export interface SuggestOktmoPayload extends BaseSuggestPayload {}
