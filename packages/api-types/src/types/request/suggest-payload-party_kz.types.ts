import type { PartyKzType } from '../common.types';
import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * @see https://dadata.ru/api/suggest/party_kz/
 */
export interface SuggestPartyKzPayload extends BaseSuggestPayload {
  /** Фильтрация работает по полю `type` (тип организации) */
  filters?: SuggestPartyKzFilter[] | null;
}

export interface SuggestPartyKzFilter {
  /** Тип организации */
  type?: PartyKzType;
}
