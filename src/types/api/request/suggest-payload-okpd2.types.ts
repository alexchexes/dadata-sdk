import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/okpd2/
 */
export interface SuggestOkpd2Payload extends BaseSuggestPayload {
  /**
   * Фильтрация по разделу классификатора ОКПД 2.
   *
   * Пример:
   * - Поиск внутри раздела "S":
   *   `[{ razdel: "S" }]`
   */
  filters?: {
    /** Код раздела классификатора (например, "S") */
    razdel?: string;
  }[];
}
