/** @see https://dadata.ru/api/suggest/postal_unit/ */
export interface PostalUnitSuggestion {
  /** Почтовый индекс  */
  value: string;
  /** Адрес отделения одной строкой */
  unrestricted_value: string;
  /** Подробности об отделении */
  data: {
    /** Почтовый индекс */
    postal_code: string;
    /** `true`, если отделение закрыто, иначе `false` */
    is_closed: boolean;
    /** Тип отделения (например, ГОПС) */
    type_code: string;
    /** Адрес отделения одной строкой */
    address_str: string;
    /** КЛАДР-код населённого пункта, в котором находится отделение */
    address_kladr_id: string;
    /** Код проверки адреса (@todo уточнить, что это в данном случае) */
    address_qc: string;
    /** Широта */
    geo_lat: number | null;
    /** Долгота */
    geo_lon: number | null;
    /** Режим работы в понедельник */
    schedule_mon: string | null;
    /** Режим работы во вторник */
    schedule_tue: string | null;
    /** Режим работы в среду */
    schedule_wed: string | null;
    /** Режим работы в четверг */
    schedule_thu: string | null;
    /** Режим работы в пятницу */
    schedule_fri: string | null;
    /** Режим работы в субботу */
    schedule_sat: string | null;
    /** Режим работы в воскресенье */
    schedule_sun: string | null;
  };
}
