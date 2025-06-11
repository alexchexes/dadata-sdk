import type { DivisionType, Language } from './suggest-payload-address.types';

/**
 * https://dadata.ru/api/iplocate/
 */
export interface IpLocatePayload {
  /**
   * IP-адрес
   * @example '46.226.227.20'
   */
  ip: string;
  /**
   * На каком языке вернуть результат
   * @default 'ru'
   */
  language?: Language;
  /**
   * Административное либо муниципальное деление
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   * @default 'ADMINISTRATIVE'
   */
  division?: DivisionType;
}
