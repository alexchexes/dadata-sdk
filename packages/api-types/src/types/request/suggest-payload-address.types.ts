import type { DIVISION_TYPES, LANGUAGES } from '../../constants';
import type {
  BaseSuggestPayload,
  BoundType,
  KladrIdFilter,
  LocationRestriction,
} from './suggest-payload.types';

export interface RadiusFilter {
  /** Географическая широта, например: `'59.244634'` */
  lat: string;
  /** Географическая долгота, например: `'39.913355'` */
  lon: string;
  /**
   * Радиус поиска в метрах
   * @default 100
   * @maximum 100000
   */
  radius_meters: number;
}

export type Language = (typeof LANGUAGES)[number];

export type DivisionType = (typeof DIVISION_TYPES)[number];

export interface Bound {
  value: BoundType;
}

/**
 * [см. Dadata.ru](https://dadata.ru/api/suggest/address/)
 * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107)
 */
export interface SuggestAddressPayload extends BaseSuggestPayload {
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343795)
   */
  locations_boost?: KladrIdFilter[];
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017)
   */
  from_bound?: Bound;
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017)
   */
  to_bound?: Bound;
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108)
   */
  locations?: LocationRestriction[];
  /**
   * - [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521)
   * - [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737934#id-Ограничениепоназваниюадресногообъекта-Адресбезрегионаигорода)
   * - [см. confluence](https://confluence.hflabs.ru/display/SGTDOC/address.value#address.value-Параметрrestrict_value)
   */
  restrict_value?: boolean;
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806)
   */
  locations_geo?: [RadiusFilter];
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=976388726)
   */
  language?: Language;
  /**
   * [см. confluence](https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589)
   * @default 'ADMINISTRATIVE'
   */
  division?: DivisionType;
}
