/**
 * All possible fields for address objects returned by any Dadata API endpoint.
 *
 * Some fields with a fixed set of possible values (e.g. qc_geo) include both string and numeric
 * types, as some APIs return them as strings while others (such as standardization) return numbers.
 *
 * Collected from the following sources:
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669104
 * @see https://dadata.ru/api/suggest/address/
 * @see https://dadata.ru/suggestions/usage/address/
 * @see https://dadata.ru/api/clean/address/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953
 */
interface AllAddressFields {
  /**
   * Почтовый индекс
   *
   * Дадата работает по объединенному справочнику налоговой службы ФИАС (ГАР) и Почты России.
   * В нем исправлены более 7 000 некорректных и отсутствующих индексов.
   * Однако, справочник индексов Почты детализирован только до населенных пунктов
   * (привязки к улицам и домам нет), поэтому исправлены не все-все индексы.
   */
  postal_code: null | string;
  /** Страна */
  country: string;
  /**
   * Двухсимвольный код страны ISO 3166
   * * (подсказки: v19.7+)
   */
  country_iso_code: string;
  /**
   * Федеральный округ
   * * (подсказки: v19.5+)
   */
  federal_district: null | string;
  /**
   * ФИАС-код региона
   *
   * для Белоруссии, Узбекистана и Казахстана — код OSM,
   * для остальных стран — код Geonames
   */
  region_fias_id: null | string;
  /** КЛАДР-код региона */
  region_kladr_id: null | string;
  /**
   * Код региона ISO 3166
   * * (подсказки: v19.7+)
   */
  region_iso_code: null | string;
  /** Регион с типом */
  region_with_type: null | string;
  /** Тип региона (сокращенный) */
  region_type: null | string;
  /** Тип региона */
  region_type_full: null | string;
  /** Регион */
  region: null | string;
  /**
   * ФИАС-код района в регионе
   *
   * для Белоруссии, Узбекистана и Казахстана — код OSM,
   * для остальных стран — код Geonames
   */
  area_fias_id: null | string;
  /** КЛАДР-код района в регионе */
  area_kladr_id: null | string;
  /** Район в регионе с типом */
  area_with_type: null | string;
  /** Тип района в регионе (сокращенный) */
  area_type: null | string;
  /** Тип района в регионе */
  area_type_full: null | string;
  /** Район в регионе */
  area: null | string;
  /**
   * ФИАС-код муниципального поселения
   * * (подсказки: v22.3+)
   */
  sub_area_fias_id: null | string;
  /**
   * КЛАДР-код муниципального поселения
   * * (подсказки: v22.3+)
   */
  sub_area_kladr_id: null | string;
  /**
   * Муниципальное поселение с типом
   * * (подсказки: v22.3+)
   */
  sub_area_with_type: null | string;
  /**
   * Тип муниципального поселения (сокращенный)
   * * (подсказки: v22.3+)
   */
  sub_area_type: null | string;
  /**
   * Тип муниципального поселения
   * * (подсказки: v22.3+)
   */
  sub_area_type_full: null | string;
  /**
   * Муниципальное поселение
   * * (подсказки: v22.3+)
   */
  sub_area: null | string;
  /**
   * ФИАС-код города
   *
   * для Белоруссии, Узбекистана и Казахстана — код OSM,
   * для остальных стран — код Geonames
   */
  city_fias_id: null | string;
  /** КЛАДР-код города */
  city_kladr_id: null | string;
  /** Город с типом */
  city_with_type: null | string;
  /** Тип города (сокращенный) */
  city_type: null | string;
  /** Тип города */
  city_type_full: null | string;
  /** Город */
  city: null | string;
  /** ФИАС-код района города (заполняется, только если район есть в ФИАС) */
  city_district_fias_id: null | string;
  /** Код КЛАДР района города (заполняется только при поиске типа ФИАС) */
  city_district_kladr_id: null | string;
  /**
   * Адм. район города с типом
   * * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById.
   */
  city_district_with_type: null | string;
  /**
   * Тип адм. района города (сокращенный)
   * * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById.
   */
  city_district_type: null | string;
  /**
   * Тип адм. района города
   * * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById.
   */
  city_district_type_full: null | string;
  /**
   * Адм. район города
   * * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById.
   */
  city_district: null | string;
  /**
   * ФИАС-код нас. пункта
   *
   * для Белоруссии, Узбекистана и Казахстана — код OSM,
   * для остальных стран — код Geonames
   */
  settlement_fias_id: null | string;
  /** КЛАДР-код нас. пункта */
  settlement_kladr_id: null | string;
  /** Населенный пункт с типом */
  settlement_with_type: null | string;
  /** Тип населенного пункта (сокращенный) */
  settlement_type: null | string;
  /** Тип населенного пункта */
  settlement_type_full: null | string;
  /** Населенный пункт */
  settlement: null | string;
  /** Код ФИАС планировочной структуры */
  planning_structure_fias_id: null | string;
  /** Код КЛАДР планировочной структуры */
  planning_structure_kladr_id: null | string;
  /** Планировочная структура с типом */
  planning_structure_with_type: null | string;
  /** Тип планировочной структуры (сокращенный) */
  planning_structure_type: null | string;
  /** Тип планировочной структуры */
  planning_structure_type_full: null | string;
  /** Планировочная структура */
  planning_structure: null | string;
  /**
   * ФИАС-код улицы
   *
   * для Белоруссии, Узбекистана и Казахстана — код OSM,
   * для остальных стран — код Geonames
   */
  street_fias_id: null | string;
  /** КЛАДР-код улицы */
  street_kladr_id: null | string;
  /** Улица с типом */
  street_with_type: null | string;
  /** Тип улицы (сокращенный) */
  street_type: null | string;
  /** Тип улицы */
  street_type_full: null | string;
  /** Улица */
  street: null | string;
  /**
   * ФИАС-код участка
   * * (подсказки: v21.12+)
   */
  stead_fias_id: null | string;
  /** КЛАДР-код земельного участка */
  stead_kladr_id: null | string;
  /**
   * Тип участка (сокращенный, = «уч»)
   * * (подсказки: v21.12+)
   */
  stead_type: null | string;
  /**
   * Тип участка, = «участок»
   * * (подсказки: v21.12+)
   */
  stead_type_full: null | string;
  /**
   * Участок
   * * (подсказки: v21.12+)
   */
  stead: null | string;
  /**
   * ФИАС-код дома
   *
   * для Белоруссии, Узбекистана и Казахстана — код OSM,
   * для остальных стран — код Geonames
   */
  house_fias_id: null | string;
  /** КЛАДР-код дома */
  house_kladr_id: null | string;
  /** Тип дома (сокращенный) */
  house_type: null | string;
  /** Тип дома */
  house_type_full: null | string;
  /** Дом */
  house: null | string;
  /** Тип корпуса/строения (сокращенный) */
  block_type: null | string;
  /** Тип корпуса/строения */
  block_type_full: null | string;
  /** Корпус/строение (в ФИАС - только корпус) */
  block: null | string;
  /** Тип строения */
  building_type: null | string;
  /** Строение */
  building: null | string;
  /**
   * ФИАС-код квартиры
   * * (подсказки: v20.1+)
   */
  flat_fias_id: null | string;
  /** Тип квартиры (сокращенный) */
  flat_type: null | string;
  /** Тип квартиры */
  flat_type_full: null | string;
  /** Квартира */
  flat: null | string;
  /**
   * ФИАС-код комнаты
   * * (подсказки: v22.8+)
   */
  room_fias_id: null | string;
  /**
   * Тип комнаты (сокращенный)
   * * (подсказки: v22.8+)
   */
  room_type: null | string;
  /**
   * Тип комнаты
   * * (подсказки: v22.8+)
   */
  room_type_full: null | string;
  /**
   * Комната
   * * (подсказки: v22.8+)
   */
  room: null | string;
  /** Абонентский ящик */
  postal_box: null | string;
  /**
   * ФИАС-код (он же код ГАР - object GUID) адреса для России.
   *
   * Идентификатор OpenStreetMap для Беларуси, Казахстана и Узбекистана.
   *
   * Для остальных стран — идентификатор объекта в базе GeoNames.
   *
   * в ФИАС: Код ФИАС:HOUSE.HOUSEGUID для домов
   * ADDROBJ.AOGUID для улиц, н/п и вышестоящих объектов.
   */
  fias_id: string;
  /**
   * Уровень детализации, до которого адрес найден в ФИАС:
   * - 0 — страна
   * - 1 — регион
   * - 3 — район
   * - 4 — город
   * - 5 — район города
   * - 6 — населенный пункт
   * - 7 — улица
   * - 8 — дом
   * - 9 — квартира (подсказки: v21.4+)
   * - 65 — планировочная структура
   * - 75 — земельный участок (подсказки: v21.12+)
   * - 90 — доп. территория
   * - 91 — улица в доп. территории
   * - -1 — иностранный или пустой.
   *
   * 90 и 91 только для Стандартизации
   * * При типе поиска ФИАС доступны уровни 1, 3, 4, 5, 6, 7, 8, 65
   */
  fias_level:
    | '0'
    | '1'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '65'
    | '75'
    | '90'
    | '91'
    | '-1';
  /** КЛАДР-код адреса */
  kladr_id: null | string;
  /**
   * Идентификатор объекта в базе GeoNames.
   *
   * Для российских адресов не заполняется.
   */
  geoname_id: null | string;
  /**
   * Признак центра района или региона:
   *
   * - 1 — центр района (Московская обл, Одинцовский р-н, г Одинцово)
   * - 2 — центр региона (Новосибирская обл, г Новосибирск)
   * - 3 — центр района и региона (Томская обл, г Томск)
   * - 4 — центральный район региона (Тюменская обл, Тюменский р-н)
   * - 0 — ничего из перечисленного (Московская обл, г Балашиха)
   */
  capital_marker: '0' | '1' | '2' | '3' | '4';
  /** Код ОКАТО */
  okato: null | string;
  /** Код ОКТМО */
  oktmo: null | string;
  /** Кадастровый номер */
  cadastral_number: null | string;
  /** Код ИФНС для физических лиц */
  tax_office: null | string;
  /** Код ИФНС для организаций */
  tax_office_legal: null | string;
  /**
   * В стандартизации: Исходный адрес одной строкой
   *
   * В подсказках:
   * Для организаций — адрес как в ЕГРЮЛ.
   * Для банков — адрес как в справочнике БИК.
   * В остальных случаях — пустое.
   */
  source: null | string;
  /**
   * Список исторических названий объекта нижнего уровня.
   *
   * Если подсказка до улицы — это прошлые названия этой улицы, если до города — города.
   */
  history_values: null | string[];
  /**
   * Координаты: широта
   *
   * * Координаты есть у 97% домов в Москве, 91% в Санкт-Петербурге, 69% в других городах-миллиониках и 47% по остальной России.
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   */
  geo_lat: null | string;
  /**
   * Координаты: долгота
   *
   * * Координаты есть у 97% домов в Москве, 91% в Санкт-Петербурге, 69% в других городах-миллиониках и 47% по остальной России.
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   */
  geo_lon: null | string;
  /**
   * Код точности координат:
   *
   * - 0 — точные координаты
   * - 1 — ближайший дом
   * - 2 — улица
   * - 3 — населенный пункт
   * - 4 — город
   * - 5 — координаты не определены, или отсутствуют в справочнике
   * - 6 — не загружен справочник с геокоординатами (для коробочной версии подсказок)
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   */
  qc_geo: '0' | '1' | '2' | '3' | '4' | '5' | 0 | 1 | 2 | 3 | 4 | 5;
  /**
   * Признак актуальности адреса в ФИАС:
   *
   * - 0 — актуальный
   * - 1–50 — переименован
   * - 51 — переподчинен
   * - 99 — удален
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   */
  fias_actuality_state: string;
  /**
   * Административный округ (только для Москвы)
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   */
  city_area: null | string;
  /**
   * Внутри кольцевой?
   *
   * - IN_MKAD — внутри МКАД (Москва)
   * - OUT_MKAD — за МКАД (Москва и область)
   * - IN_KAD — внутри КАД (Санкт-Петербург)
   * - OUT_KAD — за КАД (Санкт-Петербург и область)
   * - пусто — в остальных случаях
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Тарифы «Расширенный» и «Максимальный»
   */
  beltway_hit: null | 'IN_MKAD' | 'OUT_MKAD' | 'IN_KAD' | 'OUT_KAD';
  /**
   * Расстояние от кольцевой в км.
   * * Заполнено, только если beltway_hit: OUT_MKAD или OUT_KAD, иначе пустое
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Тарифы «Расширенный» и «Максимальный»
   */
  beltway_distance: null | string;
  /**
   * Кадастровый номер земельного участка
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   * * (подсказки: v22.4+)
   */
  stead_cadnum: null | string;
  /**
   * Кадастровый номер дома
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   * * (подсказки: v22.4+)
   */
  house_cadnum: null | string;
  /**
   * Количество квартир в доме
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   * * (подсказки: v24.3+)
   */
  house_flat_count: null | string;
  /**
   * Кадастровый номер квартиры
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   * * (подсказки: v22.4+)
   */
  flat_cadnum: null | string;
  /**
   * Площадь квартиры
   * * Площадь и стоимость есть у 70% квартир в России
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   */
  flat_area: null | string;
  /**
   * Рыночная стоимость м².
   * * Площадь и стоимость есть у 70% квартир в России
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * Только тариф «Максимальный»
   */
  square_meter_price: null | string;
  /**
   * Рыночная стоимость квартиры
   * * Площадь и стоимость есть у 70% квартир в России
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   */
  flat_price: null | string;
  /**
   * Кадастровый номер комнаты
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   * * (подсказки: v22.8+)
   */
  room_cadnum: null | string;
  /**
   * Часовой пояс города для России, часовой пояс страны — для иностранных адресов.
   * * Если у страны несколько поясов, вернёт минимальный и максимальный через слеш: UTC+5/UTC+6
   *
   * * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   */
  timezone: null | string;
  /**
   * Список ближайших станций метро (до трёх штук)
   *
   * - название станции
   * - название линии
   * - расстояние до станции в километрах
   *
   * В подсказках - заполняется при выборе конкретной подсказки (запрос с count=1) или через метод API findById
   * * Только тариф «Максимальный»
   */
  metro:
    | null
    | {
        /** название станции */
        name: null | string;
        /** название линии */
        line: null | string;
        /** расстояние до станции в километрах */
        distance: null | number;
      }[];
  /**
   * Подъезд (заполняется только для стандартизации)
   * * (подсказки: v21.1+)
   */
  entrance: null | string;
  /**
   * Этаж (заполняется только для стандартизации)
   * * (подсказки: v21.1+)
   */
  floor: null | string;
  /**
   * Иерархический код адреса в ФИАС (СС+РРР+ГГГ+ППП+СССС+УУУУ+ДДДД).
   *
   * Заполняется только при поиске типа ФИАС.
   * В остальных случаях необходимо использовать `fias_id`
   */
  fias_code: null | string;
  /**
   * Код пригодности к рассылке {@link https://dadata.ru/api/clean/address/#qc_complete}
   * * (заполняется только для стандартизации)
   *
   * Годится ли адрес для доставки корреспонденции:
   * | Код | Подходит для рассылки? | Описание |
   * |-|-|-|
   * | 0 | Да | Пригоден для почтовой рассылки |
   * | 10 | Под вопросом | Дома нет в ФИАС |
   * | 5 | Под вопросом | Нет квартиры. Подходит для юридических лиц или частных владений |
   * | 8 | Под вопросом | До почтового отделения — абонентский ящик или адрес до востребования. Подходит для писем, но не для курьерской доставки. |
   * | 9 | Под вопросом | Сначала проверьте, правильно ли Дадата разобрала исходный адрес |
   * | 1 | Нет | Нет региона |
   * | 2 | Нет | Нет города |
   * | 3 | Нет | Нет улицы |
   * | 4 | Нет | Нет дома |
   * | 6 | Нет | Адрес неполный |
   * | 7 | Нет | Иностранный адрес |
   */
  qc_complete:
    | null
    | '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10;
  /**
   * Признак наличия дома в ФИАС {@link https://dadata.ru/api/clean/address/#qc_house}
   * * (заполняется только для стандартизации)
   *
   * - 2 — дом в ФИАС есть
   * - 3 — в ФИАС есть похожий дом и разница только в корпусе или строении
   * - 10 — дом в ФИАС не найден
   *
   * * (see {@link https://support.dadata.ru/communities/1/topics/3174-proverka-suschestvovaniya-adresa-cherez-api})
   *
   * В кобинации с полем `qc_geo` Уточняют вероятность успешной доставки письма::
   * | Код `qc_house` | Код `qc_geo` | Вероятность доставки | Описание
   * |-|-|-|-|
   * | 2 | любой | Высокая | Дом найден в ФИАС
   * | 10 | 0 | Высокая | Дом не найден в ФИАС, но есть на картах
   * | 10 | 1 | Средняя | Дом не найден в ФИАС, но есть похожий на картах
   * | 10 | ≥ 2 | Низкая | Дом не найден в ФИАС и на картах
   */
  qc_house: null | '2' | '3' | '10' | 2 | 3 | 10;
  /**
   * Код проверки адреса {@link https://dadata.ru/api/clean/address/#qc}
   * * (заполняется только для стандартизации)
   *
   * Нужно ли вручную проверить распознанный адрес:
   * | Код | Нужно проверить вручную? | Описание |
   * |-|-|-|
   * | 0 | Нет | Адрес распознан уверенно |
   * | 1 | Да | Остались «лишние» части. Пример: «109341 Тверская область Москва Верхние Поля» — здесь лишняя «Тверская область».<br> Либо в исходном адресе недостаточно данных для уверенного разбора. Пример: «Сходня Красная 12» — здесь нет региона и города. |
   * | 2 | Нет | Адрес пустой или заведомо «мусорный» |
   * | 3 | Да | Есть альтернативные варианты. Пример: «Москва Тверская-Ямская» — в Москве четыре Тверских-Ямских улицы |
   */
  qc: null | '0' | '1' | '2' | '3' | 0 | 1 | 2 | 3;
  /**
   * Нераспознанная часть адреса.
   * Для адреса «Москва, Митинская улица, 40, вход с торца» вернет «ВХОД, С, ТОРЦА»
   * * (заполняется только для стандартизации)
   */
  unparsed_parts: null | string;
  /**
   * Поля адреса в Административно-территориальном и Муниципальном деленииях
   * * Поле в данный момент не заполняется
   * * Поле существует в подсказках начиная с версии v22.3+
   */
  divisions: null | {};
  /**
   * Зарезервировано
   * (подсказки: v23.5+)
   */
  custom: null | [];
  /**
   * Стандартизованный адрес одной строкой
   * * (только Стандартизация)
   */
  result: null | string;
}

/**
 * Fields returned by the API when using the suggestions endpoint with the ADMINISTRATIVE division.
 * These fields are present in the response if they are available for this endpoint.
 * Note that the presence of a field does not guarantee that it is populated; some fields may always
 * be null because they are reserved for other API types, yet they still appear in the response.
 *
 * Field lists and descriptions for the address suggestions (both divisions):
 * @see https://dadata.ru/api/suggest/address/
 * @see https://dadata.ru/suggestions/usage/address/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669104
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107
 *
 * About divisions:
 * @see https://dadata.ru/suggestions/usage/address/#divisions
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1358528932
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1349124365
 */
export type AddressAdministrative = Pick<
  AllAddressFields,
  | 'postal_code'
  | 'country'
  | 'country_iso_code'
  | 'federal_district'
  | 'region_fias_id'
  | 'region_kladr_id'
  | 'region_iso_code'
  | 'region_with_type'
  | 'region_type'
  | 'region_type_full'
  | 'region'
  | 'area_fias_id'
  | 'area_kladr_id'
  | 'area_with_type'
  | 'area_type'
  | 'area_type_full'
  | 'area'
  | 'city_fias_id'
  | 'city_kladr_id'
  | 'city_with_type'
  | 'city_type'
  | 'city_type_full'
  | 'city'
  | 'city_district_fias_id'
  | 'city_district_kladr_id'
  | 'city_district_with_type'
  | 'city_district_type'
  | 'city_district_type_full'
  | 'city_district'
  | 'settlement_fias_id'
  | 'settlement_kladr_id'
  | 'settlement_with_type'
  | 'settlement_type'
  | 'settlement_type_full'
  | 'settlement'
  | 'street_fias_id'
  | 'street_kladr_id'
  | 'street_with_type'
  | 'street_type'
  | 'street_type_full'
  | 'street'
  | 'stead_fias_id'
  | 'stead_type'
  | 'stead_type_full'
  | 'stead'
  | 'house_fias_id'
  | 'house_kladr_id'
  | 'house_type'
  | 'house_type_full'
  | 'house'
  | 'block_type'
  | 'block_type_full'
  | 'block'
  | 'flat_fias_id'
  | 'flat_type'
  | 'flat_type_full'
  | 'flat'
  | 'room_fias_id'
  | 'room_type'
  | 'room_type_full'
  | 'room'
  | 'postal_box'
  | 'fias_id'
  | 'fias_level'
  | 'kladr_id'
  | 'geoname_id'
  | 'capital_marker'
  | 'okato'
  | 'oktmo'
  | 'tax_office'
  | 'tax_office_legal'
  | 'source'
  | 'history_values'
  | 'geo_lat'
  | 'geo_lon'
  | 'qc_geo'
  | 'fias_actuality_state'
  | 'city_area'
  | 'beltway_hit'
  | 'beltway_distance'
  | 'stead_cadnum'
  | 'house_cadnum'
  | 'house_flat_count'
  | 'flat_cadnum'
  | 'flat_area'
  | 'square_meter_price'
  | 'flat_price'
  | 'room_cadnum'
  | 'timezone'
  | 'metro'
  | 'entrance'
  | 'floor'
  | 'fias_code'
  | 'qc_complete'
  | 'qc_house'
  | 'qc'
  | 'unparsed_parts'
  | 'divisions'
>;

/**
 * Fields returned by the API when using the suggestions endpoint with the MUNICIPAL division.
 * These fields indicate the response structure for municipal division queries;
 * their presence means the field is available, although some may be null (reserved for other API types).
 *
 * Field lists and descriptions for the address suggestions (both divisions):
 * @see https://dadata.ru/api/suggest/address/
 * @see https://dadata.ru/suggestions/usage/address/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669104
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107
 *
 * About devisions:
 * @see https://dadata.ru/suggestions/usage/address/#divisions
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1358528932
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1349124365
 *
 */
export type AddressMunicipal = Pick<
  AllAddressFields,
  | 'postal_code'
  | 'country'
  | 'country_iso_code'
  | 'federal_district'
  | 'region_fias_id'
  | 'region_kladr_id'
  | 'region_iso_code'
  | 'region_with_type'
  | 'region_type'
  | 'region_type_full'
  | 'region'
  | 'area_fias_id'
  | 'area_kladr_id'
  | 'area_with_type'
  | 'area_type'
  | 'area_type_full'
  | 'area'
  | 'sub_area_fias_id'
  | 'sub_area_kladr_id'
  | 'sub_area_with_type'
  | 'sub_area_type'
  | 'sub_area_type_full'
  | 'sub_area'
  | 'city_fias_id'
  | 'city_kladr_id'
  | 'city_with_type'
  | 'city_type'
  | 'city_type_full'
  | 'city'
  | 'settlement_fias_id'
  | 'settlement_kladr_id'
  | 'settlement_with_type'
  | 'settlement_type'
  | 'settlement_type_full'
  | 'settlement'
  | 'street_fias_id'
  | 'street_kladr_id'
  | 'street_with_type'
  | 'street_type'
  | 'street_type_full'
  | 'street'
  | 'stead_fias_id'
  | 'stead_type'
  | 'stead_type_full'
  | 'stead'
  | 'house_fias_id'
  | 'house_kladr_id'
  | 'house_type'
  | 'house_type_full'
  | 'house'
  | 'block_type'
  | 'block_type_full'
  | 'block'
  | 'flat_fias_id'
  | 'flat_type'
  | 'flat_type_full'
  | 'flat'
  | 'room_fias_id'
  | 'room_type'
  | 'room_type_full'
  | 'room'
  | 'postal_box'
  | 'fias_id'
  | 'fias_level'
  | 'kladr_id'
  | 'geoname_id'
  | 'capital_marker'
  | 'okato'
  | 'oktmo'
  | 'tax_office'
  | 'tax_office_legal'
  | 'source'
  | 'history_values'
  | 'geo_lat'
  | 'geo_lon'
  | 'qc_geo'
  | 'fias_actuality_state'
  | 'city_area'
  | 'beltway_hit'
  | 'beltway_distance'
  | 'stead_cadnum'
  | 'house_cadnum'
  | 'house_flat_count'
  | 'flat_cadnum'
  | 'flat_area'
  | 'square_meter_price'
  | 'flat_price'
  | 'room_cadnum'
  | 'timezone'
  | 'metro'
  | 'entrance'
  | 'floor'
  | 'fias_code'
  | 'qc_complete'
  | 'qc_house'
  | 'qc'
  | 'unparsed_parts'
  | 'divisions'
>;

/**
 * Address fields returned by the Standardization ("clean") API.
 *
 * @see https://dadata.ru/api/clean/address/
 */
export type AddressClean = Pick<
  AllAddressFields,
  | 'postal_code'
  | 'country'
  | 'country_iso_code'
  | 'federal_district'
  | 'region_fias_id'
  | 'region_kladr_id'
  | 'region_iso_code'
  | 'region_with_type'
  | 'region_type'
  | 'region_type_full'
  | 'region'
  | 'area_fias_id'
  | 'area_kladr_id'
  | 'area_with_type'
  | 'area_type'
  | 'area_type_full'
  | 'area'
  | 'city_fias_id'
  | 'city_kladr_id'
  | 'city_with_type'
  | 'city_type'
  | 'city_type_full'
  | 'city'
  | 'city_district_fias_id'
  | 'city_district_kladr_id'
  | 'city_district_with_type'
  | 'city_district_type'
  | 'city_district_type_full'
  | 'city_district'
  | 'settlement_fias_id'
  | 'settlement_kladr_id'
  | 'settlement_with_type'
  | 'settlement_type'
  | 'settlement_type_full'
  | 'settlement'
  | 'street_fias_id'
  | 'street_kladr_id'
  | 'street_with_type'
  | 'street_type'
  | 'street_type_full'
  | 'street'
  | 'stead_fias_id'
  | 'stead_kladr_id'
  | 'stead_type'
  | 'stead_type_full'
  | 'stead'
  | 'house_fias_id'
  | 'house_kladr_id'
  | 'house_type'
  | 'house_type_full'
  | 'house'
  | 'block_type'
  | 'block_type_full'
  | 'block'
  | 'flat_fias_id'
  | 'flat_type'
  | 'flat_type_full'
  | 'flat'
  | 'postal_box'
  | 'fias_id'
  | 'fias_level'
  | 'kladr_id'
  | 'capital_marker'
  | 'okato'
  | 'oktmo'
  | 'tax_office'
  | 'tax_office_legal'
  | 'source'
  | 'geo_lat'
  | 'geo_lon'
  | 'qc_geo'
  | 'fias_actuality_state'
  | 'city_area'
  | 'beltway_hit'
  | 'beltway_distance'
  | 'stead_cadnum'
  | 'house_cadnum'
  | 'flat_cadnum'
  | 'flat_area'
  | 'square_meter_price'
  | 'flat_price'
  | 'timezone'
  | 'metro'
  | 'entrance'
  | 'floor'
  | 'fias_code'
  | 'qc_complete'
  | 'qc_house'
  | 'qc'
  | 'unparsed_parts'
  | 'result'
>;

/**
 * Address fields returned by the API when using FIAS suggestions or FIAS-by-ID (findById/fias).
 *
 * @see https://dadata.ru/suggestions/usage/fias/
 * @see https://dadata.ru/api/find-fias/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835937
 */
export type AddressFias = Pick<
  AllAddressFields,
  | 'postal_code'
  | 'region_fias_id'
  | 'region_kladr_id'
  | 'region_with_type'
  | 'region_type'
  | 'region_type_full'
  | 'region'
  | 'area_fias_id'
  | 'area_kladr_id'
  | 'area_with_type'
  | 'area_type'
  | 'area_type_full'
  | 'area'
  | 'city_fias_id'
  | 'city_kladr_id'
  | 'city_with_type'
  | 'city_type'
  | 'city_type_full'
  | 'city'
  | 'city_district_fias_id'
  | 'city_district_kladr_id'
  | 'city_district_with_type'
  | 'city_district_type'
  | 'city_district_type_full'
  | 'city_district'
  | 'settlement_fias_id'
  | 'settlement_kladr_id'
  | 'settlement_with_type'
  | 'settlement_type'
  | 'settlement_type_full'
  | 'settlement'
  | 'planning_structure_fias_id'
  | 'planning_structure_kladr_id'
  | 'planning_structure_with_type'
  | 'planning_structure_type'
  | 'planning_structure_type_full'
  | 'planning_structure'
  | 'street_fias_id'
  | 'street_kladr_id'
  | 'street_with_type'
  | 'street_type'
  | 'street_type_full'
  | 'street'
  | 'house_fias_id'
  | 'house_kladr_id'
  | 'house_type'
  | 'house'
  | 'block'
  | 'building_type'
  | 'building'
  | 'fias_id'
  | 'fias_level'
  | 'kladr_id'
  | 'capital_marker'
  | 'okato'
  | 'oktmo'
  | 'cadastral_number'
  | 'tax_office'
  | 'tax_office_legal'
  | 'source'
  | 'history_values'
  | 'fias_actuality_state'
  | 'fias_code'
  | 'qc'
>;
