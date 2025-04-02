import type { SuggestType } from './api';
import type { MergeAll, OneOrMany } from './helpers.types';
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

export type SuggestOptionsWithFilters =
  | SuggestFmsUnitOptions
  | SuggestOkpd2Options
  | SuggestOkved2Options
  | SuggestFnsUnitOptions
  | SuggestMetroOptions
  | SuggestMktuOptions
  | SuggestPostalUnitOptions
  | SuggestPartyByOptions
  | SuggestPartyKzOptions;

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

/** Types with no additional options */
interface BaseOptionsWithType<T extends SuggestType> extends BaseSuggestOptions {
  suggestType: T;
}
/** Types with only one additional option - `filter` */
interface BaseOptionsWithFiltersWithType<T extends SuggestType> extends BaseOptionsWithType<T> {
  /** Common `filters` object for types that do no have other additional options */
  filters?: OneOrMany<Record<string, any>>;
}

export type SuggestEmailOptions = BaseOptionsWithType<'email'>;
export type SuggestCountryOptions = BaseOptionsWithType<'country'>;
export type SuggestCarBrandOptions = BaseOptionsWithType<'car_brand'>;
export type SuggestFtsUnitOptions = BaseOptionsWithType<'fts_unit'>;
export type SuggestRegionCourtOptions = BaseOptionsWithType<'region_court'>;
export type SuggestCurrencyOptions = BaseOptionsWithType<'currency'>;
export type SuggestOktmoOptions = BaseOptionsWithType<'oktmo'>;

// Options with `filter` option:

export type SuggestFmsUnitOptions = BaseOptionsWithFiltersWithType<'fms_unit'>;
export type SuggestOkpd2Options = BaseOptionsWithFiltersWithType<'okpd2'>;
export type SuggestOkved2Options = BaseOptionsWithFiltersWithType<'okved2'>;
export type SuggestFnsUnitOptions = BaseOptionsWithFiltersWithType<'fns_unit'>;
export type SuggestMetroOptions = BaseOptionsWithFiltersWithType<'metro'>;
export type SuggestMktuOptions = BaseOptionsWithFiltersWithType<'mktu'>;
export type SuggestPostalUnitOptions = BaseOptionsWithFiltersWithType<'postal_unit'>;
