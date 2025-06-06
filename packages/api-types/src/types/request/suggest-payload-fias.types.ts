import type {
  BaseSuggestPayload,
  BoundType,
  KladrIdFilter,
  LocationRestriction,
} from './suggest-payload.types';

export type BoundTypeFias = Exclude<BoundType, 'country'>;

export type LocationRestrictionFias = Omit<
  LocationRestriction,
  'country' | 'country_iso_code' | 'region_iso_code'
>;

export interface BoundFias {
  value: BoundTypeFias;
}

/**
 * {@link https://dadata.ru/api/suggest/fias/}
 * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835937}
 * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953}
 */
export interface SuggestFiasPayload extends BaseSuggestPayload {
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425529}
   */
  locations_boost?: KladrIdFilter[];
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   */
  from_bound?: BoundFias;
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   */
  to_bound?: BoundFias;
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974}
   */
  locations?: LocationRestrictionFias[];
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974#:~:text=Адрес%20без%20региона%20и%20города}
   */
  restrict_value?: boolean;
}
