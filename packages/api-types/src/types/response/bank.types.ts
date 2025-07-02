import type { SuggestionsResponse } from '../common.types';
import type { Override } from '../helpers.types';
import type { BankStatus, BankType } from '../request/suggest-payload-bank.types';
import type { BankSuggestionAddressData } from './address.types';

/**
 * Generic suggestion object returned from `suggest/bank` or `findById/bank` APIs
 */
export interface BaseBankSuggestion<T = BankSuggestionData | BankByIdSuggestionData> {
  /**
   * Наименование банка.
   * - Для банков (`opf.type = BANK`): краткое наименование (`data.name.short`).
   *   Если краткое наименование не указано — платежное наименование (`data.name.payment`).
   * - Для всех остальных: платежное наименование (`data.name.payment`)
   */
  value: string;
  /** Наименование банка (то же, что и value) */
  unrestricted_value: string;
  /** Подробности о банке */
  data: T;
}

/**
 * Suggestion object returned from `suggest/bank` API
 * - {@link https://dadata.ru/api/suggest/bank/}
 * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996078}
 */
export interface BankSuggestion extends BaseBankSuggestion<BankSuggestionData> {}

/**
 * Suggestion object returned from `findById/bank` API
 * - {@link https://dadata.ru/api/find-bank/}
 * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=820117560}
 */
export interface BankByIdSuggestion extends BaseBankSuggestion<BankByIdSuggestionData> {}

/**
 * `suggestions[ ]data.address` object returned from `suggest/bank` и `findById/bank` API
 */
export interface BankSuggestionDataAddress {
  /**
   * Адрес банка одной строкой, сокращённый по правилам, описанным здесь: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1105068073}
   * * Стандартизован, поэтому может отличаться от записанного в справочнике БИК
   */
  value: string;
  /**
   * Адрес банка одной строкой (полный, с индексом).
   * * Стандартизован, поэтому может отличаться от записанного в справочнике БИК
   */
  unrestricted_value: string;
  /** Подробности об адресе банка */
  data: BankSuggestionAddressData;
}

/**
 * `suggestions[ ]data.cbr.address` object returned from `findById/bank`.
 */
export interface BankSuggestionDataCbrAddress {
  /** Адрес управления ЦБ РФ (начиная с индекса) */
  value: string;
  /** Адрес управления ЦБ РФ (начиная с индекса) (то же, что value) */
  unrestricted_value: string;
  /** не заполняется для объекта адреса управления ЦБ РФ */
  data: null;
}

export interface BankNameInfo {
  /** платежное наименование */
  payment: string;
  /** не заполняется */
  full: null;
  /** краткое наименование */
  short: string | null;
}

export interface BankOpfInfo {
  /**
   * Код типа
   * - `CBR` — главное управление Банка России (21.2+)
   * - `BANK` — банк
   * - `BANK_BRANCH` — филиал банка
   * - `NKO` — небанковская кредитная организация (НКО)
   * - `NKO_BRANCH` — филиал НКО
   * - `RKC` — расчетно-кассовый центр
   * - `TREASURY` — территориальный орган Федерального казначейства (21.2+)
   * - `OTHER` — другой
   */
  type: BankType;
  /** не заполняется */
  full: null;
  /** не заполняется */
  short: null;
}

export interface BankOpfInfoCbr {
  /** Код типа (всегда `CBR` — ГУ Банка России) */
  type: 'CBR';
  /** не заполняется */
  full: null;
  /** не заполняется */
  short: null;
}

export interface BankStateInfo {
  /** дата актуальности сведений (unix-время в миллисекундах) */
  actuality_date: number | null;
  /** дата регистрации (unix-время в миллисекундах) */
  registration_date: number | null;
  /** дата ликвидации (unix-время в миллисекундах) */
  liquidation_date: number | null;
  /**
   * Статус организации
   * - `ACTIVE` — действующая
   * - `LIQUIDATING` — ликвидируется
   * - `LIQUIDATED` — ликвидирована
   *
   * Статус LIQUIDATED в реальных данных не встречается, потому что Банк России не возвращает
   * информацию о ликвидированных финансовых организациях.
   */
  status: BankStatus;
  /**
   * Детальный статус (c декабря 2020) (часто не заполнен)
   * - {@link https://github.com/hflabs/party-state/blob/master/party-state.csv}
   */
  code: string | null;
}

/**
 * `suggestions[ ]data` object returned from `suggest/bank`.
 */
export interface BankSuggestionData {
  /** Банковский идентификационный код (БИК) ЦБ РФ */
  bic: string;
  /** Банковский идентификационный код в системе SWIFT */
  swift: string | null;
  /** ИНН (20.3+) */
  inn: string | null;
  /** КПП (20.3+) */
  kpp: string | null;
  /** Регистрационный номер в ЦБ РФ */
  registration_number: string | null;
  /** Корреспондентский счет в ЦБ РФ */
  correspondent_account: string | null;
  /** Наименование */
  name: BankNameInfo;
  /**
   * Город для платежного поручения (поля справочника Tnp + Nnp, например `г Москва 35` или `г Москва`)
   * (начиная с версии 19.7) */
  payment_city: string | null;
  /** Тип кредитной организации */
  opf: BankOpfInfo;
  /** Адрес регистрации */
  address: BankSuggestionDataAddress;
  /** Состояние */
  state: BankStateInfo;
  /** Казначейские счета территориального ОФК (для УФК) (21.2+) */
  treasury_accounts: string[] | null;
  /** Управление ЦБ РФ, к которому относится банк. (Только в «Банк по ID») */
  cbr: null;
  /** Не заполняется */
  okpo: null;
  /** Не заполняется */
  phone?: null;
  /** Не заполняется */
  phones: null;
  /** Не заполняется */
  rkc: null;
}

/**
 * `suggestions[ ]data` object returned from `findById/bank`.
 */
export interface BankByIdSuggestionData
  extends Override<
    BankSuggestionData,
    {
      /**
       * Управление Банка России, к которому относится банк. (21.2+)
       * * В поле возвращается объект банка без заполнения гранулярных полей адреса.
       */
      cbr: BankSuggestionDataCbr | null;
    }
  > {}

/**
 * `suggestions[ ]data.cbr` object returned from `findById/bank`.
 * This is basically a veriation of normal `BankSuggestionData` object
 */
export interface BankSuggestionDataCbr
  extends Override<
    BankSuggestionData,
    {
      /** Тип кредитной организации (всегда — ГУ Банка России) */
      opf: BankOpfInfoCbr;
      /** Не заполняется для объекта адреса управления ЦБ РФ */
      cbr: null;
      /** Данные об адресе управления ЦБ РФ */
      address: BankSuggestionDataCbrAddress;
      /** БИК управления ЦБ РФ */
      bic: string;
    }
  > {}

export type SuggestBankResponse = SuggestionsResponse<BankSuggestion>;
export type FindBankResponse = SuggestionsResponse<BankByIdSuggestion>;
