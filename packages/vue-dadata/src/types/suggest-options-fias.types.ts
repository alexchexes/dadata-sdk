import type {
  BoundTypeFias,
  KladrIdFilter,
  LocationRestrictionFias,
  OneOrMany,
} from '@dadata-sdk/api-types';

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
  /** Whether `fromBound` includes its selected level. Default `true`. */
  fromBoundInclude?: boolean;
  toBound?: BoundTypeFias;
  /** Whether `toBound` includes its selected level. Default `true`. */
  toBoundInclude?: boolean;
  locationsFilter?: OneOrMany<LocationRestrictionFias | string | number>;
  restrictValue?: boolean;
}
