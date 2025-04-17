import type { DIVISION_TYPES, LANGUAGES } from '@/const/api';
import type {
  BaseSuggestPayload,
  BoundType,
  KladrIdFilter,
  LocationRestriction,
} from './suggest-payload.types';

export interface RadiusFilter {
  lat: string;
  lon: string;
  radius_meters: number;
}

export type Language = (typeof LANGUAGES)[number];

export type DivisionType = (typeof DIVISION_TYPES)[number];

export interface Bound {
  value: BoundType;
}

/**
 * {@link https://dadata.ru/api/suggest/address/}
 * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107}
 */
export interface SuggestAddressPayload extends BaseSuggestPayload {
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343795}
   */
  locations_boost?: KladrIdFilter[];
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   */
  from_bound?: Bound;
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   */
  to_bound?: Bound;
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108}
   */
  locations?: LocationRestriction[];
  /**
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737934#id-Ограничениепоназваниюадресногообъекта-Адресбезрегионаигорода}
   * - {@link https://confluence.hflabs.ru/display/SGTDOC/address.value#address.value-Параметрrestrict_value}
   */
  restrict_value?: boolean;
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806}
   */
  locations_geo?: [RadiusFilter];
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=976388726}
   */
  language?: Language;
  /**
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589}
   */
  division?: DivisionType;
}
