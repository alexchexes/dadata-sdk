import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/region_court/
 */
export interface SuggestRegionCourtPayload extends BaseSuggestPayload {
  /**
   * Фильтрация мировых судов
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestRegionCourtFilter[];
}

export interface SuggestRegionCourtFilter {
  /** первые 2 цифры КЛАДР-кода региона (`77` или `04`) мирового суда */
  region_code?: string;
}
