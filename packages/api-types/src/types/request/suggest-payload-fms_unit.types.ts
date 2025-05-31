import type { BaseSuggestPayload } from './suggest-payload.types';
import type { FmsUnitType } from '../common.types';

/**
 * @see https://dadata.ru/api/suggest/fms_unit/
 */
export interface SuggestFmsUnitPayload extends BaseSuggestPayload {
  /**
   * Фильтрация подразделений ФМС
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestFmsUnitFilter[];
}

export interface SuggestFmsUnitFilter {
  /** первые 2 цифры КЛАДР-кода региона (`77` или `04`) подразделения ФМС */
  region_code?: string;
  /**
   * Вид подразделения:
   * - `0` — подразделение ФМС
   * - `1` — ГУВД или МВД региона
   * - `2` — УВД или ОВД района или города
   * - `3` — отделение полиции
   */
  type?: FmsUnitType;
}
