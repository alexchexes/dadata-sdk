/** @see https://dadata.ru/api/suggest/country/ */
export interface CountrySuggestion {
  /** Краткое название страны (как показывается в списке подсказок), например, "Таиланд" */
  value: string;
  /** Полное название страны. Например, "Королевство Таиланд" */
  unrestricted_value: string;
  /** Подробные данные о стране */
  data: CountrySuggestionData;
}

export interface CountrySuggestionData {
  /** Цифровой код страны. Например "764" */
  code: string;
  /** Буквенный код альфа-2. Например, "TH" */
  alfa2: string;
  /** Буквенный код альфа-3. Например, "THA" */
  alfa3: string;
  /** Краткое название страны, например, "Таиланд" */
  name_short: string;
  /** Полное название страны. Например, "Королевство Таиланд" */
  name: string;
}
