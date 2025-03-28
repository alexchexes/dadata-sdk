import type { OneOrMany } from './helpers.types';
import type { BaseSuggestOptions } from './suggest-options.types';
import type {
  BoundType,
  DivisionType,
  KladrIdFilter,
  Language,
  LocationRestriction,
  RadiusFilter,
} from '@/types/api';

export type LocationsFilterItem = string | number | LocationRestriction | KladrIdFilter;

/**
 * Normal (not FIAS) address suggestions options
 */
export interface SuggestAddressOptions extends BaseSuggestOptions {
  suggestType: 'address';
  /** A single kladr_id or an array of kladr_id's. */
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
  fromBound?: BoundType;
  toBound?: BoundType;
  locationsFilter?: OneOrMany<LocationsFilterItem>;
  restrictValue?: Boolean;
  radiusFilter?: RadiusFilter;
  language?: Language;
  division?: DivisionType;
}
