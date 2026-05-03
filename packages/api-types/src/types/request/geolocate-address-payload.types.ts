import type { DivisionType, Language } from './suggest-payload-address.types';

/**
 * https://dadata.ru/api/geolocate/
 */
export interface GeolocateAddressPayload {
  /**
   * Географическая широта
   * @format double
   * @example 55.601983
   */
  lat: number;
  /**
   * Географическая долгота
   * @format double
   * @example 37.359486
   */
  lon: number;
  /**
   * Радиус поиска в метрах
   * @format double
   * @default 100
   * @maximum 1000
   */
  radius_meters?: number | null;
  /**
   * Максимальное количество результатов
   * @default 10
   * @format int32
   * @maximum 20
   */
  count?: number | null;
  /**
   * На каком языке вернуть результат
   * @default 'ru'
   */
  language?: Language | null;
  /**
   * Административное либо муниципальное деление
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   * @default 'ADMINISTRATIVE'
   */
  division?: DivisionType | null;
}
