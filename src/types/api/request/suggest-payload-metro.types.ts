import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/metro/
 */
export interface SuggestMetroPayload extends BaseSuggestPayload {
  /**
   * Фильтрация станций метро по различным параметрам.
   *
   * Можно указать один или несколько объектов фильтрации.
   * Все поля внутри одного фильтра интерпретируются как `AND`,
   * а между фильтрами действует логика `OR`.
   *
   * Примеры:
   * - Поиск среди станций Санкт-Петербурга:
   *   `[{ city_kladr_id: "7800000000000" }]`
   *
   * - Поиск среди открытых станций Кольцевой ветки Москвы:
   *   `[{ city: "Москва", line_id: "5", is_closed: null }]`
   */
  filters?: {
    /** КЛАДР-код города (например, "7700000000000" для Москвы) */
    city_kladr_id?: string;
    /** ФИАС-код города (например, "0c5b2444-70a0-4932-980c-b4dc0d3f02b5" для Москвы) */
    city_fias_id?: string;
    /** Название города (например, "Москва") */
    city?: string;
    /** Номер линии метро (например, "5" для Кольцевой линии) */
    line_id?: string;
    /**
     * Фильтр по признаку «закрыта»
     * - `true` - только закрытые
     * - `null` - только открытые
     * @note Документация на https://dadata.ru/api/suggest/metro/ предполагает здесь `true/false`,
     * однако фактически API использует `true/null`.
     */
    is_closed?: true | null;
  }[];
}
