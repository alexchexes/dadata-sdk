import type { SuggestPostalUnitFilter } from './suggest-payload-postal_unit.types';

/**
 * https://dadata.ru/api/suggest/postal_unit/
 */
export interface GeolocatePostalUnitPayload {
  /**
   * Географическая широта
   * @format double
   * @example 55.878
   */
  lat: number;
  /**
   * Географическая долгота
   * @format double
   * @example 37.653
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
   * Фильтрация почтовых отделений
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestPostalUnitFilter[] | null;
}
