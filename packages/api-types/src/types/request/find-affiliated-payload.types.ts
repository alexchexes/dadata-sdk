export type AffilatedSearchScope = 'FOUNDERS' | 'MANAGERS';

/**
 * https://dadata.ru/api/find-affiliated/
 */
export interface FindAffiliatedPayload {
  /**
   * Текст запроса
   */
  query: string;
  /**
   * Максимальное количество результатов
   * @default 10
   * @maximum 300
   */
  count?: number;
  /**
   * Фильтр - Где искать
   * - `FOUNDERS` - среди учредителей
   * - `MANAGERS` - среди руководителей
   *
   * @see https://dadata.ru/api/find-affiliated/#scope
   *
   * @example {"query": "7736207543","scope": ["FOUNDERS"]} // Только среди учредителей
   * @example {"query": "7736207543","scope": ["MANAGERS"]} // Только среди руководителей
   *
   * @default ['FOUNDERS', 'MANAGERS']
   */
  scope?: AffilatedSearchScope[];
}
