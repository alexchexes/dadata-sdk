import type { SuggestType } from './api';
import type { MergeAll } from './helpers.types';
import type { SuggestAddressOptions } from './suggest-options-address.types';
import type { SuggestBankOptions } from './suggest-options-bank.types';
import type { SuggestFiasOptions } from './suggest-options-fias.types';
import type { SuggestFioOptions } from './suggest-options-fio.types';
import type { SuggestPartyOptions } from './suggest-options-party.types';
import type { SuggestPartyByOptions } from './suggest-options-party_by.types';
import type { SuggestPartyKzOptions } from './suggest-options-party_kz.types';

/** Options common for all suggest types */
export interface BaseSuggestOptions {
  /** Dadata API token (key) for suggestions (not standartization) */
  token: string;

  /** Type of Dadata suggestions (determines which Dadata API endpoint to use) */
  suggestType: SuggestType;

  /** Текст запроса */
  query: string;

  /** Количество результатов (максимум — 20) */
  count?: number;

  /** Custom URL of an API in case you proxy requests.  */
  url?: string;

  /** `false` disables http requests caching. Default `true` */
  httpCache?: boolean;
}

export type SuggestOptions =
  | SuggestAddressOptions
  | SuggestFiasOptions
  | SuggestPartyOptions
  | SuggestBankOptions
  | SuggestFioOptions
  | SuggestEmailOptions
  | SuggestCountryOptions
  | SuggestPostalUnitOptions
  | SuggestPartyByOptions
  | SuggestPartyKzOptions
  | SuggestFmsUnitOptions
  | SuggestCarBrandOptions
  | SuggestFnsUnitOptions
  | SuggestFtsUnitOptions
  | SuggestRegionCourtOptions
  | SuggestMetroOptions
  | SuggestMktuOptions
  | SuggestCurrencyOptions
  | SuggestOkved2Options
  | SuggestOkpd2Options
  | SuggestOktmoOptions;

export type MergedSuggestOptions = MergeAll<
  [
    SuggestAddressOptions,
    SuggestFiasOptions,
    SuggestPartyOptions,
    SuggestBankOptions,
    SuggestFioOptions,

    SuggestEmailOptions,
    SuggestCountryOptions,
    SuggestPostalUnitOptions,
    SuggestPartyByOptions,
    SuggestPartyKzOptions,
    SuggestFmsUnitOptions,
    SuggestCarBrandOptions,
    SuggestFnsUnitOptions,
    SuggestFtsUnitOptions,
    SuggestRegionCourtOptions,
    SuggestMetroOptions,
    SuggestMktuOptions,
    SuggestCurrencyOptions,
    SuggestOkved2Options,
    SuggestOkpd2Options,
    SuggestOktmoOptions,
  ]
>;

/** Types with no additional options. Created via generic helper to reduce boilerplate */
interface BaseOptionsWithType<T extends SuggestType> extends BaseSuggestOptions {
  suggestType: T;
}
export type SuggestEmailOptions = BaseOptionsWithType<'email'>;
export type SuggestCountryOptions = BaseOptionsWithType<'country'>;
export type SuggestPostalUnitOptions = BaseOptionsWithType<'postal_unit'>;
export type SuggestFmsUnitOptions = BaseOptionsWithType<'fms_unit'>;
export type SuggestCarBrandOptions = BaseOptionsWithType<'car_brand'>;
export type SuggestFnsUnitOptions = BaseOptionsWithType<'fns_unit'>;
export type SuggestFtsUnitOptions = BaseOptionsWithType<'fts_unit'>;
export type SuggestRegionCourtOptions = BaseOptionsWithType<'region_court'>;
export type SuggestMetroOptions = BaseOptionsWithType<'metro'>;
export type SuggestMktuOptions = BaseOptionsWithType<'mktu'>;
export type SuggestCurrencyOptions = BaseOptionsWithType<'currency'>;
export type SuggestOkved2Options = BaseOptionsWithType<'okved2'>;
export type SuggestOkpd2Options = BaseOptionsWithType<'okpd2'>;
export type SuggestOktmoOptions = BaseOptionsWithType<'oktmo'>;
