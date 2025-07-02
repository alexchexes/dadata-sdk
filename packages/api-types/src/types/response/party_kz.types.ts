import type { PartyKzStatus, PartyKzType, SuggestionsResponse } from '../common.types';

/**
 * Suggestion returned from `suggest/party_kz` and `findById/party_kz` APIs
 * @see https://dadata.ru/api/suggest/party_kz/
 */
export interface PartyKzSuggestion {
  /**
   * Наименование организации + БИН (бизнес-идентификационный номер)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности об организации
   */
  data: PartyKzSuggestionData;
}

export interface PartyKzSuggestionData {
  /** БИН (бизнес-идентификационный номер) */
  bin: string;
  /** Дата регистрации (timestamp в миллисекундах) */
  registration_date: string;
  /**
   * Статус организации:
   * - ACTIVE — действующая
   * - INACTIVE — бездействующая
   * - LIQUIDATING — ликвидируется
   * - LIQUIDATED — ликвидирована
   * - SUSPENDED — деятельность приостановлена
   */
  status: PartyKzStatus;
  /**
   * Тип организации:
   * - LEGAL — юридическое лицо
   * - BRANCH — филиал
   * - INDIVIDUAL — индивидуальный предприниматель
   * - INDIVIDUAL_JOINT_VENTURE — ИП (совместный)
   * - FOREIGN_BRANCH — филиал иностранного юрлица
   */
  type: PartyKzType;
  /** Наименование на русском языке */
  name_ru: string | null;
  /** Наименование на казахском языке */
  name_kz: string | null;
  /** ФИО руководителя */
  fio: string | null;
  /** Код административно-территориального объекта (КАТО) */
  kato: string | null;
  /** Адрес одной строкой на русском языке */
  address_ru: string | null;
  /** Адрес одной строкой на казахском языке */
  address_kz: string | null;
  /** Адрес населенного пункта на русском языке */
  address_settlement_ru: string | null;
  /** Адрес населенного пункта на казахском языке */
  address_settlement_kz: string | null;
  /** Адрес внутри населенного пункта */
  address_local: string | null;
  /** Код основного вида деятельности (ОКЭД) */
  oked: string | null;
  /** Наименование основного вида деятельности на русском языке */
  oked_name_ru: string | null;
  /** Наименование основного вида деятельности на казахском языке */
  oked_name_kz: string | null;
  /** Код размерности предприятия */
  krp: string | null;
  /** Наименование размерности предприятия на русском языке */
  krp_name_ru: string | null;
  /** Наименование размерности предприятия на казахском языке */
  krp_name_kz: string | null;
  /** Код сектора экономики */
  kse: string | null;
  /** Наименование сектора экономики на русском языке */
  kse_name_ru: string | null;
  /** Наименование сектора экономики на казахском языке */
  kse_name_kz: string | null;
  /** Код формы собственности */
  kfs: string | null;
  /** Наименование формы собственности на русском языке */
  kfs_name_ru: string | null;
  /** Наименование формы собственности на казахском языке */
  kfs_name_kz: string | null;
}

export type SuggestPartyKzResponse = SuggestionsResponse<PartyKzSuggestion>;
