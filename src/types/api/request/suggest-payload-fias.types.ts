import type {
  BaseSuggestPayload,
  BoundType,
  KladrIdFilter,
  LocationRestriction,
} from './suggest-payload.types';

export type BoundTypeFias = Exclude<BoundType, 'country'>;

export type LocationRestrictionFias = Omit<LocationRestriction, 'country'>;

/**
 * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953}
 */
export interface SuggestFiasPayload extends BaseSuggestPayload {
  locations_boost?: KladrIdFilter[];
  from_bound?: { value: BoundTypeFias };
  to_bound?: { value: BoundTypeFias };
  locations?: LocationRestrictionFias[];
  restrict_value?: Boolean;
}
