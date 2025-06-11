/**
 * https://dadata.ru/api/suggest/postal_unit/
 */
export interface GeolocatePostalUnitPayload {
  /**
   * Географическая широта
   * @example 55.878
   */
  lat: number;
  /**
   * Географическая долгота
   * @example 37.653
   */
  lon: number;
  /**
   * Радиус поиска в метрах
   * @default 100
   * @maximum 1000
   */
  radius_meters?: number;
  /**
   * Максимальное количество результатов
   * @default 10
   * @maximum 20
   */
  count?: number;
}
