import type { BoundTypeFias, KladrIdFilter, LocationRestrictionFias } from './api';
import type { OneOrMany } from './helpers.types';
import type { BaseSuggestOptions } from './suggest-options.types';

/**
 * FIAS address suggestions options
 */
export interface SuggestFiasOptions extends BaseSuggestOptions {
  suggestType: 'fias';
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
  fromBound?: BoundTypeFias;
  toBound?: BoundTypeFias;
  locationsFilter?: OneOrMany<LocationRestrictionFias | string | number>;
  restrictValue?: Boolean;
}
