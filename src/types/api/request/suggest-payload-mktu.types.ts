import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/mktu/
 */
export interface SuggestMktuPayload extends BaseSuggestPayload {
  /**
   * Фильтрация записей МКТУ
   * * Поля внутри одного фильтра интерпретируются как `AND`, между фильтрами - как `OR`
   */
  filters?: SuggestMktuFilter[];
}

export type SuggestMktuFilter = {
  /** Класс МКТУ, например `"25"` или `"03"` */
  class?: string;
};
