import type { BranchType, PartyStatus, PartyType } from '../common.types';
import type { BaseSuggestPayload, KladrIdFilter } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/party/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669120
 */
export interface SuggestPartyPayload extends BaseSuggestPayload {
  /**
   * Фильтр по типу организации. API принимает одно из двух значений в виде строки:
   * - `LEGAL` - юрлицо
   * - `INDIVIDUAL` - ИП
   *
   * {@link https://dadata.ru/api/suggest/party/}
   */
  type?: PartyType;

  /**
   * Фильтр по статусу организации. API принимает массив. Например:
   * - действующие: `["ACTIVE"]`
   * - ликвидируемые и ликвидированные: `["LIQUIDATING", "LIQUIDATED"]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   */
  status?: PartyStatus[];

  /**
   * Фильтр по типу филиала
   * - `MAIN` - искать только по головным организациям
   * - `BRANCH` - искать только по филиалам
   */
  branch_type?: BranchType | BranchType[];

  /**
   * Фильтр по коду ОКВЭД. API принимает массив вида `["07.1", "07.10", "07.2", "07.21"]`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1093075333}
   */
  okved?: string[];

  /**
   * Фильтр по региону (**двузначный** код).
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
