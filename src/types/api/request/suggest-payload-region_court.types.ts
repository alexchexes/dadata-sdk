import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/region_court/
 */
export interface SuggestRegionCourtPayload extends BaseSuggestPayload {
  /**
   * Фильтрация работает по полю region_code (первые 2 цифры КЛАДР-кода региона)
   */
  filters?: {
    region_code?: string;
  }[];
}
