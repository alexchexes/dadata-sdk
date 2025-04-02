import type { BOUND_TYPES, RESTRICTION_TYPES } from '@/const/api';
import type { SuggestAddressPayload } from './suggest-payload-address.types';
import type { SuggestBankPayload } from './suggest-payload-bank.types';
import type { SuggestFiasPayload } from './suggest-payload-fias.types';
import type { SuggestFioPayload } from './suggest-payload-fio.types';
import type { SuggestFmsUnitPayload } from './suggest-payload-fms_unit.types';
import type { SuggestFnsUnitPayload } from './suggest-payload-fns_unit.types';
import type { SuggestPartyByPayload } from './suggest-payload-party_by.types';
import type { SuggestPartyKzPayload } from './suggest-payload-party_kz.types';
import type { SuggestPartyPayload } from './suggest-payload-party.types';
import type { SuggestPostalUnitPayload } from './suggest-payload-postal_unit.types';
import type { SuggestRegionCourtPayload } from './suggest-payload-region_court.types';
import type { SuggestMetroPayload } from './suggest-payload-metro.types';
import type { SuggestMktuPayload } from './suggest-payload-mktu.types';
import type { SuggestOkved2Payload } from './suggest-payload-okved2.types';
import type { SuggestOkpd2Payload } from './suggest-payload-okpd2.types';

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
  | SuggestBankPayload
  | SuggestCarBrandPayload
  | SuggestCountryPayload
  | SuggestCurrencyPayload
  | SuggestEmailPayload
  | SuggestFiasPayload
  | SuggestFioPayload
  | SuggestFmsUnitPayload
  | SuggestFnsUnitPayload
  | SuggestFtsUnitPayload
  | SuggestMetroPayload
  | SuggestMktuPayload
  | SuggestOkpd2Payload
  | SuggestOktmoPayload
  | SuggestOkved2Payload
  | SuggestPartyByPayload
  | SuggestPartyKzPayload
  | SuggestPartyPayload
  | SuggestPostalUnitPayload
  | SuggestRegionCourtPayload;

/**
 * No special options for 'email'
 * @see https://dadata.ru/api/suggest/email/
 */
export interface SuggestCarBrandPayload extends BaseSuggestPayload {}
export interface SuggestCountryPayload extends BaseSuggestPayload {}
export interface SuggestCurrencyPayload extends BaseSuggestPayload {}
export interface SuggestEmailPayload extends BaseSuggestPayload {}
export interface SuggestFtsUnitPayload extends BaseSuggestPayload {}
export interface SuggestOktmoPayload extends BaseSuggestPayload {}
