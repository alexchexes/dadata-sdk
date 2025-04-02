/** @see https://dadata.ru/api/suggest/region_court/ */
export interface RegionCourtSuggestion {
  /**
   * Название суда одной строкой (как показывается в списке подсказок)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности о судебном участке
   */
  data: {
    /** Код суда */
    code: string;
    /** Полное название суда */
    name: string;
    /** Код региона (первые 2 цифры КЛАДР-кода) */
    region_code: string;
  };
}
