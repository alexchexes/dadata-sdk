import type { DivisionType, Language } from './suggest-payload-address.types';

/**
 * https://dadata.ru/api/iplocate/
 */
export interface IpLocatePayload {
  /**
   * IP-адрес для определения города.
   *
   * Если не указан, будет использован IP из заголовка `X-Forwarded-For`.
   * Если и там пусто, будет использован IP сокета соединения.
   *
   * @example '46.226.227.20'
   */
  ip?: string | null;
  /**
   * На каком языке вернуть результат
   * @default 'ru'
   */
  language?: Language | null;
  /**
   * Административное либо муниципальное деление
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   * @default 'ADMINISTRATIVE'
   */
  division?: DivisionType | null;
}
