import type {
  BaseSuggestPayload,
  BoundType,
  KladrIdFilter,
  LocationRestriction,
} from './suggest-payload.types';

export type BoundTypeFias = Exclude<BoundType, 'country' | 'flat'>;

/**
 * Ограничение сектора поиска ФИАС.
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974
 */
export type LocationRestrictionFias = Omit<
  LocationRestriction,
  'country' | 'country_iso_code' | 'region_iso_code'
>;

/** Объект для передачи границы поиска в параметрах подсказок по ФИАС */
export interface BoundFias {
  /**
   * Возможные значения:
   * - `region` - Регион
   * - `area` - Район
   * - `city` - Город
   * - `settlement` - Населенный пункт
   * - `planning_structure` - Планировочная структура
   * - `street` - Улица
   * - `house` - Дом
   */
  value: BoundTypeFias;
}

/**
 * Параметры запроса к API "Подсказки по ФИАС"
 *
 * @see https://dadata.ru/api/suggest/fias/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835937
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953
 */
export interface SuggestFiasPayload extends BaseSuggestPayload {
  /**
   * Приоритет города или региона при ранжировании.
   * Передавайте код КЛАДР (kladr_id). Можно указать несколько кодов.
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425529
   */
  locations_boost?: KladrIdFilter[] | null;

  /**
   * Гранулярные подсказки по ФИАС – "левая" граница.
   *
   * Доступные границы:
   *
   * - `region` - Регион
   * - `area` - Район
   * - `city` - Город
   * - `settlement` - Населенный пункт
   * - `planning_structure` - Планировочная структура
   * - `street` - Улица
   * - `house` - Дом
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521
   */
  from_bound?: BoundFias;

  /**
   * Гранулярные подсказки по ФИАС – "правая" граница.
   *
   * Доступные границы:
   *
   * - `region` - Регион
   * - `area` - Район
   * - `city` - Город
   * - `settlement` - Населенный пункт
   * - `planning_structure` - Планировочная структура
   * - `street` - Улица
   * - `house` - Дом
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521
   */
  to_bound?: BoundFias;

  /**
   * Ограничение сектора поиска адреса.
   *
   * Чтобы искать адреса только в определенном регионе, городе, районе и т.д.,
   * укажите их в параметре locations.
   * Можно указать несколько ограничений, но не более 10.
   *
   * **Адрес без региона и города:**
   * Чтобы адрес одной строкой в ответе (поле `value`) не содержал регион / город, заданный в ограничении,
   * добавьте в запрос параметр `restrict_value` = true.
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974
   */
  locations?: LocationRestrictionFias[] | null;

  /**
   * Используется совместно с ограничениями (параметр `locations`), чтобы адрес в ответе
   * (поле `value`) не содержал регион / город / район и т.д., заданный в ограничении.
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974#:~:text=Адрес%20без%20региона%20и%20города
   */
  restrict_value?: boolean | null;
}
