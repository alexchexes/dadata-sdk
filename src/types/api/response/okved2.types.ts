/** @see https://dadata.ru/api/suggest/okved2/ */
export interface Okved2Suggestion {
  /** Наименование вида деятельности (как показывается в списке подсказок) */
  value: string;
  /** То же, что и value */
  unrestricted_value: string;
  /** Подробности из классификатора ОКВЭД 2 */
  data: {
    /** Индекс (составной код, включает раздел и подкод) */
    idx: string;
    /** Код раздела (например, "H") */
    razdel: string;
    /** Код (например, "51.22.3") */
    kod: string;
    /** Наименование вида деятельности */
    name: string;
  };
}
