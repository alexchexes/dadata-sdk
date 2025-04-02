import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/mktu/
 */
export interface SuggestMktuPayload extends BaseSuggestPayload {
  /**
   * Фильтрация записей МКТУ по одному или нескольким классам.
   *
   * Все поля внутри одного фильтра интерпретируются как `AND`,
   * между фильтрами действует логика `OR`.
   *
   * Пример:
   * - Поиск в классе "03":
   *   `[{ class: "03" }]`
   */
  filters?: {
    /** Класс МКТУ, например "25" */
    class?: string;
  }[];
}
