import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/postal_unit/
 */
export interface SuggestPostalUnitPayload extends BaseSuggestPayload {
  /**
   * Адрес строкой или почтовый индекс
   *
   * @example { "query": "дежнева 2а" } // по адресу
   * @example { "query": "105" } // все отделения с индексом, начинающимся на 105
   */
  query: string;
  /**
   * Фильтрация почтовых отделений
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestPostalUnitFilter[];
}

export interface SuggestPostalUnitFilter {
  /** Фильтрация по признаку открыто/закрыто. `false` - искать только открытые, `true` - только закрытые
   */
  is_closed?: boolean;
  /** Фильтрация по типу отделения (например, `ГОПС`) */
  type_code?: string;
  /** Фильтрация по населённому пункту отделения. Например `'6300000100000'` (КЛАД-код города) */
  address_kladr_id?: string;
}
