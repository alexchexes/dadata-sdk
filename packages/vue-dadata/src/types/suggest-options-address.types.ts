import type {
  BoundType,
  DivisionType,
  KladrIdFilter,
  Language,
  LocationRestriction,
  OneOrMany,
  RadiusFilter,
} from '@dadata-sdk/api-types';

import type { BaseSuggestOptions } from './suggest-options.types';

export type LocationsFilterItem = string | number | LocationRestriction | KladrIdFilter;

/**
 * Normal (not FIAS) address suggestions options
 * - {@link https://dadata.ru/api/suggest/address/}
 * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107}
 */
export interface SuggestAddressOptions extends BaseSuggestOptions {
  suggestType: 'address';
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
  fromBound?: BoundType;
  /** Whether `fromBound` includes its selected level. Default `true`. */
  fromBoundInclude?: boolean;
  toBound?: BoundType;
  /** Whether `toBound` includes its selected level. Default `true`. */
  toBoundInclude?: boolean;
  locationsFilter?: OneOrMany<LocationsFilterItem>;
  restrictValue?: boolean;
  radiusFilter?: RadiusFilter;
  language?: Language;
  division?: DivisionType;
}
