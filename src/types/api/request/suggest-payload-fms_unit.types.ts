import type { BaseSuggestPayload } from './suggest-payload.types';
import type { FmsUnitType } from '../api-common.types';

/**
 * @see https://dadata.ru/api/suggest/fms_unit/
 */
export interface SuggestFmsUnitPayload extends BaseSuggestPayload {
  /**
   * Фильтрация работает по полям `region_code` (первые 2 цифры КЛАДР-кода региона)
   * и `type` (вид подразделения):
   */
  filters?: {
    region_code?: string;
    type?: FmsUnitType;
  }[];
}
