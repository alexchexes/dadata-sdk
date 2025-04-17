/** @see https://dadata.ru/api/suggest/mktu/ */
export interface MktuSuggestion {
  /** Наименование на русском (как показывается в списке подсказок) */
  value: string;
  /** То же, что и value */
  unrestricted_value: string;
  /** Подробности из классификатора МКТУ */
  data: MktuSuggestionData;
}

export interface MktuSuggestionData {
  /** Класс МКТУ (например, "25") */
  class: string;
  /** Уникальный номер позиции в классификаторе */
  number: string;
  /** Наименование на русском языке */
  name_ru: string;
  /** Наименование на английском языке */
  name_en: string;
  /** Наименование на французском языке */
  name_fr: string;
}
