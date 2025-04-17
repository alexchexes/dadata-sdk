/** @see https://dadata.ru/api/suggest/fns_unit/ */
export interface FnsUnitSuggestion {
  /**
   * Название инспекции одной строкой (как показывается в списке подсказок)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности об инспекции ФНС
   */
  data: FnsUnitSuggestionData;
}

export interface FnsUnitSuggestionData {
  /** Код инспекции */
  code: string;
  /** Полное название инспекции */
  name: string;
  /** Краткое название инспекции */
  name_short: string;
  /** Адрес инспекции одной строкой */
  address: string | null;
  /** Телефон(ы) инспекции */
  phone: string | null;
  /** Код ОКПО и режим работы */
  comment: string | null;
  /** Получатель платежа */
  payment_name: string | null;
  /** Код ОКТМО бюджетополучателя */
  oktmo: string | null;
  /** ИНН получателя */
  inn: string | null;
  /** КПП получателя */
  kpp: string | null;
  /** Название банка получателя */
  bank_name: string | null;
  /** БИК банка получателя */
  bank_bic: string | null;
  /** Корреспондентский счёт банка */
  bank_correspondent_account: string | null;
  /** Счёт получателя в банке */
  bank_account: string | null;
  /** Код регистрирующей инспекции */
  parent_code: string | null;
  /** Название регистрирующей инспекции */
  parent_name: string | null;
  /** Адрес регистрирующей инспекции */
  parent_address: string | null;
  /** Телефон регистрирующей инспекции */
  parent_phone: string | null;
  /** Режим работы регистрирующей инспекции */
  parent_comment: string | null;
}
