import type { BoundTypeFias, KladrIdFilter, LocationRestrictionFias } from './api';
import type { OneOrMany } from './helpers.types';
import type { BaseSuggestOptions } from './suggest-options.types';

/**
 * FIAS address suggestions options
 * {@link https://dadata.ru/api/suggest/fias/}
 * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835937}
 */
export interface SuggestFiasOptions extends BaseSuggestOptions {
  suggestType: 'fias';
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
  fromBound?: BoundTypeFias;
  toBound?: BoundTypeFias;
  locationsFilter?: OneOrMany<LocationRestrictionFias | string | number>;
  restrictValue?: boolean;
}
