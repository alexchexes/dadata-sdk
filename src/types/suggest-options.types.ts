import type { SuggestType } from './api';
import type { MergeAll } from './helpers.types';
import type { SuggestAddressOptions } from './suggest-options-address.types';
import type { SuggestBankOptions } from './suggest-options-bank.types';
import type { SuggestFiasOptions } from './suggest-options-fias.types';
import type { SuggestFioOptions } from './suggest-options-fio.types';
import type { SuggestPartyOptions } from './suggest-options-party.types';

/** Options common for all suggest types */
export interface BaseSuggestOptions {
  /** Текст запроса */
  query: string;

  /** Количество результатов (максимум — 20) */
  count?: number;

  /** Dadata API token (key) for suggestions (not standartization) */
  token: string;

  /** Custom URL of an API in case you proxy requests.  */
  url?: string;

  /** `false` disables http requests caching. Default `true` */
  httpCache?: boolean;

  /** Type of Dadata suggestions (determines which Dadata API endpoint to use) */
  suggestType: SuggestType;
}

export type SuggestOptions =
  | SuggestAddressOptions
  | SuggestFiasOptions
  | SuggestFioOptions
  | SuggestBankOptions
  | SuggestPartyOptions
  | SuggestEmailOptions;

export type MergedSuggestOptions = MergeAll<
  [
    SuggestAddressOptions,
    SuggestFiasOptions,
    SuggestFioOptions,
    SuggestBankOptions,
    SuggestPartyOptions,
    SuggestEmailOptions,
  ]
>;

/** No additional options for 'email' type */
export interface SuggestEmailOptions extends BaseSuggestOptions {
  suggestType: 'email';
}
