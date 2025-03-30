import type { PARTY_STATUSES, PARTY_TYPES } from '@/const/api';
import type { BaseSuggestPayload, KladrIdFilter } from './suggest-payload.types';

export type PartyType = (typeof PARTY_TYPES)[number];
export type PartyStatus = (typeof PARTY_STATUSES)[number];

/**
 * @see https://dadata.ru/api/suggest/party/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669120
 */
export interface SuggestPartyPayload extends BaseSuggestPayload {
  /**
   * Ограничение по типу организации. API принимает одно из двух значений в виде строки:
   * - `LEGAL` - юрлицо
   * - `INDIVIDUAL` - ИП
   *
   * {@link https://dadata.ru/api/suggest/party/}
   */
  type?: PartyType;

  /**
   * Ограничение по статусу организации. API принимает массив. Например:
   * - действующие: `["ACTIVE"]`
   * - ликвидируемые и ликвидированные: `["LIQUIDATING", "LIQUIDATED"]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   */
  status?: PartyStatus[];

  /**
   * Ограничение по коду ОКВЭД. API принимает массив вида `["07.1", "07.10", "07.2", "07.21"]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1093075333}
   */
  okved?: string[];

  /**
   * Ограничение по региону (**двузначный** код).
   * API принимает массив вида `{ kladr_id: string }[]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669123}
   */
  locations?: KladrIdFilter[];

  /**
   * Приоритет города при ранжировании.
   * API принимает массив вида `{ kladr_id: string }[]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343852}
   */
  locations_boost?: KladrIdFilter[];
}
