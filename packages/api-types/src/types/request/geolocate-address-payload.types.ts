import type { DivisionType, Language } from './suggest-payload-address.types';

/**
 * https://dadata.ru/api/geolocate/
 */
export interface GeolocateAddressPayload {
  /**
   * Географическая широта
   * @example 55.601983
   */
  lat: number;
  /**
   * Географическая долгота
   * @example 37.359486
   */
  lon: number;
  /**
   * Максимальное количество результатов
   * @default 10
   * @maximum 20
   */
  count?: number;
  /**
   * Радиус поиска в метрах
   * @default 100
   * @maximum 1000
   */
  radius_meters?: number;
  /**
   * На каком языке вернуть результат
   * @default 'ru'
   */
  language?: Language;
  /**
   * Административное либо муниципальное деление
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   * @default 'ADMINISTRATIVE'
   */
  division?: DivisionType;
}
