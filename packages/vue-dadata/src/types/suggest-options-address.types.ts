import type { BaseSuggestOptions } from './suggest-options.types';
import type {
  BoundType,
  DivisionType,
  KladrIdFilter,
  Language,
  LocationRestriction,
  RadiusFilter,
  OneOrMany,
} from '@dadata-sdk/api-types';

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
  toBound?: BoundType;
  locationsFilter?: OneOrMany<LocationsFilterItem>;
  restrictValue?: boolean;
  radiusFilter?: RadiusFilter;
  language?: Language;
  division?: DivisionType;
}
