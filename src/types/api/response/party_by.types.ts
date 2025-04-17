import type { PartyByStatus, PartyByType } from '../api-common.types';

/**
 * Suggestion returned from `suggest/party_by` and `findById/party_by` APIs
 * @see https://dadata.ru/api/suggest/party_by
 */
export interface PartyBySuggestion {
  /**
   * Наименование организации + УНП (учетный номер налогоплательщика)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности об организации
   */
  data: PartyBySuggestionData;
}

export interface PartyBySuggestionData {
  /** УНП (учетный номер налогоплательщика) */
  unp: string;
  /** Дата регистрации (в формате timestamp, миллисекунды с начала эпохи) */
  registration_date: string;
  /** Дата исключения из ЕГР, если применимо (timestamp) */
  removal_date: string | null;
  /** Дата последних изменений (timestamp) */
  actuality_date: string;
  /**
   * Статус организации:
   * - ACTIVE — действующая
   * - LIQUIDATING — ликвидируется
   * - LIQUIDATED — ликвидирована
   * - BANKRUPT — банкротство
   * - SUSPENDED — деятельность приостановлена
   * - REORGANIZING — реорганизуется
   */
  status: PartyByStatus;
  /**
   * Тип организации:
   * - LEGAL — юридическое лицо
   * - INDIVIDUAL — индивидуальный предприниматель
   */
  type: PartyByType;
  /** Полное наименование на русском языке */
  full_name_ru: string | null;
  /** Полное наименование на белорусском языке */
  full_name_by: string | null;
  /** Краткое наименование на русском языке */
  short_name_ru: string | null;
  /** Краткое наименование на белорусском языке */
  short_name_by: string | null;
  /** Торговое наименование на русском языке (только для юрлиц) */
  trade_name_ru: string | null;
  /** Торговое наименование на белорусском языке (только для юрлиц) */
  trade_name_by: string | null;
  /** ФИО на русском языке (только для ИП) */
  fio_ru: string | null;
  /** ФИО на белорусском языке (только для ИП) */
  fio_by: string | null;
  /** Адрес местонахождения одной строкой на русском языке (только для юрлиц) */
  address: string | null;
  /** Код основного вида деятельности (ОКЭД) */
  oked: string | null;
  /** Наименование основного вида деятельности на русском языке */
  oked_name: string | null;
}
