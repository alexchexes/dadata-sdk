import type { BOUND_TYPES, RESTRICTION_TYPES } from '../../constants';

export type LocationRestrictionKey = (typeof RESTRICTION_TYPES)[number];

export type LocationRestriction = {
  [K in LocationRestrictionKey]?: string;
};

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
   * @default 10
   */
  count?: number;
}

export interface SuggestCarBrandPayload extends BaseSuggestPayload {}
export interface SuggestCountryPayload extends BaseSuggestPayload {}
export interface SuggestCurrencyPayload extends BaseSuggestPayload {}
export interface SuggestEmailPayload extends BaseSuggestPayload {}
export interface SuggestFtsUnitPayload extends BaseSuggestPayload {}
export interface SuggestOktmoPayload extends BaseSuggestPayload {}
