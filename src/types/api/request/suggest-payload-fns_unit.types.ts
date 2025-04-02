import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/fns_unit/
 */
export interface SuggestFnsUnitPayload extends BaseSuggestPayload {
  /**
   * Фильтрация работает по полю region_code (первые 2 цифры КЛАДР-кода региона)
   */
  filters?: {
    region_code?: string;
  }[];
}
