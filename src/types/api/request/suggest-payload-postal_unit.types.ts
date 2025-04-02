import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/postal_unit/
 */
export interface SuggestPostalUnitPayload extends BaseSuggestPayload {
  /**
   * Фильтрация работает по полям `is_closed`, `type_code` и `address_kladr_id`.
   *
   * Фильтрация по `address_kladr_id` позволяет выбрать отделения из указанного города:
   * - `[{address_kladr_id: '6300000100000'}]`
   *
   * Фильтрация по `is_closed` позволяет отсеять закрытые отделения
   * - `[{is_closed: false}]`
   */
  filters?: {
    is_closed?: boolean;
    type_code?: string;
    address_kladr_id?: string;
  }[];
}
