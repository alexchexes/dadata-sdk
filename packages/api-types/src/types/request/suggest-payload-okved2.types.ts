import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/okved2/
 */
export interface SuggestOkved2Payload extends BaseSuggestPayload {
  /**
   * Фильтрация по разделу классификатора ОКВЭД 2.
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestOkved2Filter[];
}

export interface SuggestOkved2Filter {
  /** Код раздела классификатора ОКВЭД 2 (например, `"J"`) */
  razdel?: string;
}
