import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/okved2/
 */
export interface SuggestOkved2Payload extends BaseSuggestPayload {
  /**
   * Фильтрация по разделу классификатора ОКВЭД 2.
   *
   * Пример:
   * - Поиск внутри раздела "J":
   *   `[{ razdel: "J" }]`
   */
  filters?: {
    /** Код раздела классификатора (например, "J") */
    razdel?: string;
  }[];
}
