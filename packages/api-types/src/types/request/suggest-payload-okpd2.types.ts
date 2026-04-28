import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/okpd2/
 */
export interface SuggestOkpd2Payload extends BaseSuggestPayload {
  /**
   * Фильтрация по разделу классификатора ОКПД 2.
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestOkpd2Filter[] | null;
}

export interface SuggestOkpd2Filter {
  /** Код раздела классификатора ОКПД 2 (например `'S'`) */
  razdel?: string;
}
