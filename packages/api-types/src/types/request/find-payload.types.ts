// payload types for every /findById endpoint

import type { BranchType, PartyStatus, PartyType } from '../common.types';
import type { DivisionType, Language } from './suggest-payload-address.types';

export interface BaseFindByIdPayload {
  /**
   * @maxLength 300
   */
  query: string;
  /**
   * Максимальное количество результатов
   * @default 10
   * @maximum 20
   */
  count?: number;
}

/**
 * Адрес по коду
 * @see https://dadata.ru/api/find-address/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=312016944
 */
export interface FindAddressPayload extends BaseFindByIdPayload {
  /**
   * Любой из идентификаторов адреса:
   * - ФИАС-код до дома, он же ГАР-код (`fias_id`), только для России (19.7+)
   * - ФИАС-код квартиры (`flat_fias_id`), только для России (21.2+)
   * - КЛАДР-код до улицы (`kladr_id`) - только для России
   * - Идентификатор OpenStreetMap (`fias_id`) - для Беларуси, Казахстана и Узбекистана (20.7+)
   * - Идентификатор GeoNames (`geoname_id`) - для всех остальных стран (20.7+)
   * - кадастровый номер (`stead_cadnum`, `house_cadnum` или `flat_cadnum`) - только для России (22.5+)
   *
   * Ищет только по точному совпадению, для частичного совпадения
   * используйте API `suggest` (https://dadata.ru/api/suggest/bank/)
   *
   * * ИНН и КПП начиная с версиии подсказок 20.3+
   *
   * @example {"query": "5f96fd6b-b3de-451f-b280-8fedf859e683"} // ФИАС
   * @example {"query": "77000000000292300"} // КЛАДР
   * @example {"query": "way:208547592"} // OpenStreetMap
   * @example {"query": "1857910", "language":"en"} // Geonames, вернуть результат на английском
   */
  query: string;
  /**
   * На каком языке вернуть результат (ru / en)
   */
  language?: Language;
  /**
   * Административное либо муниципальное деление
   * @default 'ADMINISTRATIVE'
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   */
  division?: DivisionType;
}

/**
 * Адрес строго по ФИАС
 * @see https://dadata.ru/api/find-fias/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835965
 */
export interface FindFiasPayload extends BaseFindByIdPayload {
  /**
   * Код КЛАДР или ФИАС, по которому нужно получить подсказку
   *
   * @example { "query": "5f96fd6b-b3de-451f-b280-8fedf859e683" } // ФИАС
   * @example { "query": "77000000000292300" } // КЛАДР
   */
  query: string;
}

/**
 * Организации РФ
 * @see https://dadata.ru/api/find-party/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058
 */
export interface FindPartyPayload extends BaseFindByIdPayload {
  /**
   * ИНН или ОГРН.
   *
   * Также поддерживается поиск по КПП, однако налоговая не сообщает КПП для ~25% компаний,
   * эти компании найти по КПП не получится
   *
   * @maxLength 300
   */
  query: string;
  /**
   * КПП организации
   * * для ~25% компаний налоговая не сообщает КПП филиалов
   *
   * @example { "query": "7707083893", "kpp": "540602001" }
   */
  kpp?: string;
  /**
   * Головная организация (`MAIN`) или филиал (`BRANCH`).
   *
   * @example { "query": "7707083893", "branch_type": "MAIN" }
   */
  branch_type?: BranchType;
  /**
   * Юрлицо (`LEGAL`) или индивидуальный предприниматель (`INDIVIDUAL`)
   * @example {"query": "7707083893","type": "LEGAL"} // Юрлица
   * @example {"query": "784806113663","type": "INDIVIDUAL"} // Индивидуальные предприниматели
   */
  type?: PartyType;
  /**
   * Ограничение по статусу организации
   */
  status?: PartyStatus[];
}

/**
 * Компании Беларуси
 * @see https://dadata.ru/api/suggest/party_by/
 */
export interface FindPartyByPayload extends BaseFindByIdPayload {
  /**
   * УНП (учетный номер налогоплательщика)
   */
  query: string;
}

/**
 * Компании Казахстана
 * @see https://dadata.ru/api/suggest/party_kz/
 */
export interface FindPartyKzPayload extends BaseFindByIdPayload {
  /**
   * БИН (бизнес-идентификационный номер)
   */
  query: string;
}

/**
 * Банк
 * @see https://dadata.ru/api/find-bank/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=820117560
 */
export interface FindBankPayload extends BaseFindByIdPayload {
  /**
   * Любой из идентификаторов банка:
   * - БИК,
   * - SWIFT,
   * - ИНН,
   * - ИНН + КПП (для филиалов),
   * - регистрационному номеру, присвоенному Банком России.
   *
   * Ищет только по точному совпадению, для частичного совпадения
   * используйте API `suggest` (https://dadata.ru/api/suggest/bank/)
   *
   * * ИНН и КПП начиная с версиии подсказок 20.3+
   */
  query: string;
  /**
   * КПП банка
   *
   * * подсказки 20.3+
   */
  kpp?: string;
}

/**
 * Отделения Почты России
 * @see https://dadata.ru/api/suggest/postal_unit/
 */
export interface FindPostalUnitPayload extends BaseFindByIdPayload {
  /**
   * Почтовый индекс
   * @example { "query": "127642" }
   */
  query: string;
}

/**
 * Налоговые инспекции
 * @see https://dadata.ru/api/suggest/fns_unit/
 */
export interface FindFnsUnitPayload extends BaseFindByIdPayload {
  /**
   * Код инспекции или ИНН
   * @example { "query": "5257" } // код инспекции
   * @example { "query": "7727406020" } // ИНН
   */
  query: string;
}

/**
 * Таможни
 * @see https://dadata.ru/api/suggest/fts_unit/
 */
export interface FindFtsUnitPayload extends BaseFindByIdPayload {
  /**
   * Код таможни
   * @example { "query": "10002000" }
   */
  query: string;
}

/**
 * Мировые суды
 * @see https://dadata.ru/api/suggest/region_court/
 */
export interface FindRegionCourtPayload extends BaseFindByIdPayload {
  /**
   * Код суда
   * @example { "query": "52MS0022" }
   */
  query: string;
}

/**
 * Марки автомобилей
 * @see https://dadata.ru/api/suggest/car_brand/
 */
export interface FindCarBrandPayload extends BaseFindByIdPayload {
  /**
   * Идентификатор марки
   * @example { "query": "FORD" }
   */
  query: string;
}

/**
 * Страны
 * @see https://dadata.ru/api/suggest/country/
 */
export interface FindCountryPayload extends BaseFindByIdPayload {
  /**
   * Название или один из кодов страны:
   * - Цифровой код страны (поле `code` в ответе)
   * - Буквенный код альфа-2 (поле `alfa2` в ответе)
   * - Буквенный код альфа-3 (поле `alfa3` в ответе)
   *
   * @example { "query": "764" } // Цифровой код
   * @example { "query": "TH" } // alpha-2
   * @example { "query": "THA" } // alpha-3
   */
  query: string;
}

/**
 * Валюты
 * @see https://dadata.ru/api/suggest/currency/
 */
export interface FindСurrencyPayload extends BaseFindByIdPayload {
  /**
   * Цифровой или буквенный код валюты
   * @example { "query": "RUB" } // Буквенный код
   * @example { "query": "643" } // Цифровой код
   */
  query: string;
}

/**
 * Товары и услуги (МКТУ)
 * @see https://dadata.ru/api/suggest/mktu/
 */
export interface FindMktuPayload extends BaseFindByIdPayload {
  /**
   * Уникальный номер из МКТУ
   * @example { "query": "250173" }
   */
  query: string;
}

/**
 * Виды деятельности (ОКВЭД 2)
 * @see https://dadata.ru/api/suggest/okved2/
 */
export interface FindOkved2Payload extends BaseFindByIdPayload {
  /**
   * Код ОКВЭД
   * @example { "query": "51.22.3" }
   */
  query: string;
}

/**
 * Виды продукции (ОКПД 2)
 * @see https://dadata.ru/api/suggest/okpd2/
 */
export interface FindOkpd2Payload extends BaseFindByIdPayload {
  /**
   * Код ОКПД
   * @example { "query": "95.23.10.133" }
   */
  query: string;
}

/**
 * Муниципальные образования (ОКТМО)
 * @see https://dadata.ru/api/suggest/oktmo/
 */
export interface FindOktmoPayload extends BaseFindByIdPayload {
  /**
   * Код ОКТМО
   *
   * Особенности:
   *
   * Оригинальный справочник ОКТМО содержит 4 уровня муниципальных образований:
   * - регион
   * - муниципальный район,
   * - муниципальное поселение,
   * - населенный пункт.
   *
   * Справочник ОКТМО «Дадаты» содержит только 2 уровня — муниципальные районы и поселения.
   * Это объекты с 8-значным кодом ОКТМО.
   * Чтобы получить муниципальное образование по 11-значному коду ОКТМО, возьмите первые 8 цифр.
   *
   * @example { "query": "54623425" }
   */
  query: string;
}

/**
 * ID города в службах доставки
 * @see https://dadata.ru/api/delivery/
 */
export interface FindDeliveryPayload extends BaseFindByIdPayload {
  /**
   * КЛАДР-код города
   * @example { "query": "3100400100000" }
   */
  query: string;
}
