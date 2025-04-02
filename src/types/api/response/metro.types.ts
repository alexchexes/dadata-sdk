/** @see https://dadata.ru/api/suggest/metro/ */
export interface MetroSuggestion {
  /**
   * Название станции (как показывается в списке подсказок)
   */
  value: string;
  /**
   * Название станции + линия
   */
  unrestricted_value: string;
  /**
   * Подробности о станции метро
   */
  data: {
    /** КЛАДР-код города */
    city_kladr_id: string;
    /** ФИАС-код города */
    city_fias_id: string;
    /** Название города */
    city: string;
    /** Название станции */
    name: string;
    /** Номер линии */
    line_id: string;
    /** Название линии */
    line_name: string;
    /** Координаты: широта */
    geo_lat: number | null;
    /** Координаты: долгота */
    geo_lon: number | null;
    /** Цвет линии в RGB (шестнадцатеричный, без #) */
    color: string | null;
    /**
     * Признак «закрыта» (`true` — закрыта, `null` — открыта)
     * @note Документация на https://dadata.ru/api/suggest/metro/ предполагает true/false, но это не так
     */
    is_closed: true | null;
  };
}
