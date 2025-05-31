/** @see https://dadata.ru/api/suggest/car_brand/ */
export interface CarBrandSuggestion {
  /**
   * Название марки одной строкой (как показывается в списке подсказок)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности о марке автомобиля
   */
  data: CarBrandSuggestionData;
}

export interface CarBrandSuggestionData {
  /** Идентификатор марки */
  id: string;
  /** Наименование марки (латиницей) */
  name: string;
  /** Наименование марки на русском языке */
  name_ru: string;
}
