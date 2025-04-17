/** @see https://dadata.ru/api/suggest/okpd2/ */
export interface Okpd2Suggestion {
  /** Наименование продукции (как показывается в списке подсказок) */
  value: string;
  /** То же, что и value */
  unrestricted_value: string;
  /** Подробности из классификатора ОКПД 2 */
  data: Okpd2SuggestionData;
}

export interface Okpd2SuggestionData {
  /** Индекс (составной код, включает раздел и подкод) */
  idx: string | null;
  /** Код раздела (например, "S") */
  razdel: string;
  /** Код (например, "95.23.10.133") */
  kod: string;
  /** Наименование продукции или услуги */
  name: string;
}
