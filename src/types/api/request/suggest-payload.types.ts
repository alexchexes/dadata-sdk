import type { SuggestEmailOptions } from '@/types/suggest-options.types';
import type { SuggestAddressPayload } from './suggest-payload-address.types';
import type { SuggestBankPayload } from './suggest-payload-bank.types';
import type { SuggestFioPayload } from './suggest-payload-fio.types';
import type { SuggestPartyPayload } from './suggest-payload-party.types';
import type { BOUND_TYPES, RESTRICTION_TYPES } from '@/const/api';
import type { SuggestFiasPayload } from './suggest-payload-fias.types';

export type BoundType = (typeof BOUND_TYPES)[number];

export type LocationRestriction = {
  [K in (typeof RESTRICTION_TYPES)[number]]?: string;
};

export interface KladrIdFilter {
  kladr_id?: string;
}

export interface BaseSuggestPayload {
  /** Query string */
  query: string;
  /** Maximum amount of results (up to 20) */
  count?: number;
}

export type SuggestPayload =
  | SuggestAddressPayload
  | SuggestFiasPayload
  | SuggestFioPayload
  | SuggestBankPayload
  | SuggestPartyPayload
  | SuggestEmailOptions;

/**
 * No special options for 'email'
 * @see https://dadata.ru/api/suggest/email/
 */
export interface SuggestEmailPayload extends BaseSuggestPayload {}
