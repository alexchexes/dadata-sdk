import type { PartyByStatus, PartyByType } from '../api-common.types';
import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/party_by/
 */
export interface SuggestPartyByPayload extends BaseSuggestPayload {
  /**
   * Фильтрация работает по полям `status` (статус организации) и `type` (тип организации).
   *
   * Если заданы оба параметра (`status` и `type`), необходимо передавать не отдельные объекты с одним полем,
   * а массив объектов, представляющий декартово произведение всех комбинаций `type` и `status`.
   *
   * ❌ Неправильно:
   * [{ type: 'LEGAL' }, { status: 'BANKRUPT' }, { status: 'SUSPENDED' }]
   *
   * ✅ Правильно:
   * [{ type: 'LEGAL', status: 'BANKRUPT' }, { type: 'LEGAL', status: 'SUSPENDED' }]
   */
  filters?: {
    status?: PartyByStatus;
    type?: PartyByType;
  }[];
}
