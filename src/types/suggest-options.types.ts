import type { SuggestType } from './api';
import type { MergeAll } from './helpers.types';
import type { SuggestAddressOptions } from './suggest-options-address.types';
import type { SuggestBankOptions } from './suggest-options-bank.types';
import type { SuggestFiasOptions } from './suggest-options-fias.types';
import type { SuggestFioOptions } from './suggest-options-fio.types';
import type { SuggestPartyOptions } from './suggest-options-party.types';

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
  | SuggestEmailOptions;

export type MergedSuggestOptions = MergeAll<
  [
    SuggestAddressOptions,
    SuggestFiasOptions,
    SuggestPartyOptions,
    SuggestBankOptions,
    SuggestFioOptions,
    SuggestEmailOptions,
  ]
>;

/** No additional options for 'email' type */
export interface SuggestEmailOptions extends BaseSuggestOptions {
  suggestType: 'email';
}
