/**
 * @see https://dadata.ru/api/find-company/by-email/
 */
export interface FindPartyByEmailPayload {
  /**
   * Адрес эл. почты
   * @example 'info@dadata.ru'
   */
  query: string;
}
