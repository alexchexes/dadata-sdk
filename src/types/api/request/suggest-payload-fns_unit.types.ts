import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/fns_unit/
 */
export interface SuggestFnsUnitPayload extends BaseSuggestPayload {
  /**
   * Фильтрация налоговых инспекций
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestFnsUnitFilter[];
}

export type SuggestFnsUnitFilter = {
  /** первые 2 цифры КЛАДР-кода региона (`77` или `04`) налоговой инспекции */
  region_code?: string;
};
