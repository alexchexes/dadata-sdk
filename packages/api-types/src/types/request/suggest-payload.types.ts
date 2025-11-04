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

/** @see https://dadata.ru/api/suggest/car_brand/ */
export interface SuggestCarBrandPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/country/ */
export interface SuggestCountryPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/currency/ */
export interface SuggestCurrencyPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/email/ */
export interface SuggestEmailPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/fts_unit/ */
export interface SuggestFtsUnitPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/oktmo/ */
export interface SuggestOktmoPayload extends BaseSuggestPayload {}

/** @internal Not included in schemas, exists for consumer convenience. */
export interface BaseSuggestion<T extends Record<string, unknown> = Record<string, unknown>> {
  value: string;
  unrestricted_value: string;
  data: T;
}
