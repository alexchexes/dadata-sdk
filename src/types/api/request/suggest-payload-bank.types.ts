import type { BANK_STATUSES, BANK_TYPES } from '@/const/api';
import type { BaseSuggestPayload, KladrIdFilter } from './suggest-payload.types';

export type BankType = (typeof BANK_TYPES)[number];
export type BankStatus = (typeof BANK_STATUSES)[number];

/**
 * @see https://dadata.ru/api/suggest/bank/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996078
 */
export interface SuggestBankPayload extends BaseSuggestPayload {
  /**
   * Ограничение по типу банка.
   * API принимает массив, например: `"type": ["BANK", "BANK_BRANCH"]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122}
   */
  type?: BankType[];

  /**
   * Ограничение по статусу банка.
   * API принимает массив, например: `"status": ["LIQUIDATING"]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120}
   */
  status?: BankStatus[];

  /**
   * Ограничение по региону или городу
   * API принимает массив вида `{ kladr_id: string }[]`
   *  {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106238}
   */
  locations?: KladrIdFilter[];

  /**
   * Приоритет города при ранжировании.
   * API принимает массив вида `{ kladr_id: string }[]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106242}
   */
  locations_boost?: KladrIdFilter[];
}
