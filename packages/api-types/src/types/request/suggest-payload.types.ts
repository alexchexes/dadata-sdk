import type { BOUND_TYPES } from '../../constants';

/**
 * Объект для передачи ограничения сектора поиска адреса.
 *
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108
 */
export type LocationRestriction = {
  /**
   * Ограничение по ISO-коду страны в формате [ISO_3166](https://ru.wikipedia.org/wiki/ISO_3166).
   * Например: `BY`.
   * По умолчанию - `RU`.
   * Чтобы разрешить любые страны - укажите `*`.
   */
  country_iso_code?: string | null;
  /**
   * ISO-код региона. Например: `BY-BR`
   */
  region_iso_code?: string | null;

  /**
   * Ограничение по КЛАДР-коду. Например:
   * - `63` — Самарская обл.
   * - `63000001` — г. Самара
   * - `6300000100000` — г. Самара (полный код)
   *
   * Не рекомендуем использовать для объектов ниже города:
   * - не слишком надежно для населенных пунктов (КЛАДР-коды н/п довольно часто меняются);
   * - не работает для план. структур (они появились после того, как была придумана иерархия КЛАДР, и не вписываются в нее);
   * - очень ненадежно для улиц (КЛАДР-коды улиц часто меняются);
   * - не работает для домов.
   *
   * Рекомендуем использовать `fias_id` - [ограничение по ФИАС-коду](https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737930).
   */
  kladr_id?: string | null;

  /**
   * Ограничение по почтовому индексу.
   *
   * @example '420000'
   */
  postal_code?: string | null;

  /**
   * Ограничение по ФИАС-коду.
   *
   * Например: `"fias_id": "110d6ad9-0b64-47cf-a2ee-7e935228799c"` - Санкт-Петербург, г Пушкин
   *
   * Ограничение по fias_id дома не поддерживается
   */
  fias_id?: string | null;
  /** Ограничение по ФИАС-коду региона. Лучшая альтернатива - `fias_id`. */
  region_fias_id?: string | null;
  /** Ограничение по ФИАС-коду административного района. Лучшая альтернатива - `fias_id`. */
  area_fias_id?: string | null;
  /** Ограничение по ФИАС-коду муниципального поселения. Лучшая альтернатива - `fias_id`. */
  sub_area_fias_id?: string | null;
  /** Ограничение по ФИАС-коду города. Лучшая альтернатива - `fias_id`. */
  city_fias_id?: string | null;
  /** Ограничение по ФИАС-коду района города. Лучшая альтернатива - `fias_id`. */
  city_district_fias_id?: string | null;
  /** Ограничение по ФИАС-коду населённого пункта. Лучшая альтернатива - `fias_id`. */
  settlement_fias_id?: string | null;
  /**
   * Ограничение по ФИАС-коду планировочной структуры. Лучшая альтернатива - `fias_id`.
   * * *не задокументировано для API адресов, только для API ФИАС, но работает*
   */
  planning_structure_fias_id?: string | null;
  /** Ограничение по ФИАС-коду улицы. Лучшая альтернатива - `fias_id`. */
  street_fias_id?: string | null;

  /** Ограничение по названию страны */
  country?: string | null;
  /** Ограничение по названию региона */
  region?: string | null;
  /** Ограничение по названию административного района */
  area?: string | null;
  /** Ограничение по названию муниципального поселения */
  sub_area?: string | null;
  /** Ограничение по названию города */
  city?: string | null;
  /**
   * Ограничение по названию района города
   * * *не задокументировано для API адресов, только для API ФИАС, но работает*
   */
  city_district?: string | null;
  /** Ограничение по названию населённого пункта */
  settlement?: string | null;
  /**
   * Ограничение по названию планировочной структуры
   * * *не задокументировано для API адресов, только для API ФИАС, но работает*
   */
  planning_structure?: string | null;
  /** Ограничение по названию улицы */
  street?: string | null;

  /** Ограничение по полному типу региона, например: `республика` */
  region_type_full?: string | null;
  /** Ограничение по полному типу адм. района в регионе. Например: `улус` */
  area_type_full?: string | null;
  /** Ограничение по полному типу муниципального поселения */
  sub_area_type_full?: string | null;
  /** Ограничение по полному типу города. Например: `поселок городского типа` */
  city_type_full?: string | null;
  /**
   * Ограничение по полному типу района города.
   * * *не задокументировано для API адресов, только для API ФИАС, но работает*
   */
  city_district_type_full?: string | null;
  /** Ограничение по полному типу населенного пункта. Например: `деревня` */
  settlement_type_full?: string | null;
  /**
   * Ограничение по полному типу планировочной структуры. Например: `территория снт`
   * * *не задокументировано для API адресов, только для API ФИАС, но работает*
   */
  planning_structure_type_full?: string | null;
  /** Ограничение по полному типу улицы. Например: `проспект` */
  street_type_full?: string | null;
};

export type LocationRestrictionKey = keyof LocationRestriction;

export type BoundType = (typeof BOUND_TYPES)[number];

/** Объект для передачи КЛАДР-кода */
export interface KladrIdFilter {
  kladr_id?: string | null;
}

export interface BaseSuggestPayload {
  /**
   * Текст запроса.
   * @maxLength 300
   */
  query: string;
  /**
   * Максимальное количество результатов.
   * @format int32
   * @minimum 1
   * @maximum 20
   * @default 10
   */
  count?: number | null;
}

/** @see https://dadata.ru/api/suggest/car_brand/ */
export interface SuggestCarBrandPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/country/ */
export interface SuggestCountryPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/currency/ */
export interface SuggestCurrencyPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/email/ */
export interface SuggestEmailPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/fts_unit/ */
export interface SuggestFtsUnitPayload extends BaseSuggestPayload {}

/** @see https://dadata.ru/api/suggest/oktmo/ */
export interface SuggestOktmoPayload extends BaseSuggestPayload {}

/** @internal Not included in schemas, exists for consumer convenience. */
export interface BaseSuggestion<T extends Record<string, unknown> = Record<string, unknown>> {
  value: string;
  unrestricted_value: string;
  data: T;
}
