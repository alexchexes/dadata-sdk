import type {
  BranchType,
  FioGenders,
  PartyStatus,
  PartyType,
  SuggestionsResponse,
} from '../common.types';
import type { Override } from '../helpers.types';
import type { PartySuggestionAddressData } from './address.types';
import type { PartyByEmailEmailData } from './email.types';

/**
 * Объект подсказки, возвращаемый из API `suggest/party`, `findById/party`, `findAffiliated/party`
 *
 * - @see https://dadata.ru/api/suggest/party
 * - @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669122
 *
 * - @see https://dadata.ru/api/find-party/
 * - @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058
 *
 * - @see https://dadata.ru/api/find-affiliated/
 */
export interface PartySuggestion {
  /**
   * Краткое наименование организации (data.name.short_with_opf).
   * Если краткое наименование не указано — полное наименование (data.name.full_with_opf)
   */
  value: string;
  /**
   * Краткое наименование организации (То же, что и value)
   */
  unrestricted_value: string;
  /**
   * Подробности об организации
   */
  data: PartyLegal | PartyIndividual;
}

/**
 * Объект адреса (`data.address`), возвращаемый API `suggest/party` и `findById/party`
 */
export interface PartyAddress {
  /**
   * Адрес одной строкой, сокращённый по правилам, описанным здесь: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1105068073}
   * - Для юрлиц: **адрес организации**
   * - Для ИП: **город проживания**
   *
   * * Стандартизован, поэтому может отличаться от записанного в ЕГРЮЛ
   */
  value: string;
  /**
   * Адрес одной строкой (полный, с индексом).
   * - Для юрлиц: **адрес организации**
   * - Для ИП: **город проживания**
   *
   * * Стандартизован, поэтому может отличаться от записанного в ЕГРЮЛ.
   */
  unrestricted_value: string;
  /**
   * Недостоверность сведений об адресе (только в «Организация по ИНН», Только «Максимальный» тариф)
   * - {@link https://dadata.ru/api/find-party/#invalidity}
   */
  invalidity: InvalidityInfo | null;
  /** Подробности об адресе организации */
  data: PartySuggestionAddressData;
}

export interface PartyNameInfo {
  /** Полное наименование */
  full_with_opf: string;
  /** Краткое наименование */
  short_with_opf: string;
  /** Полное наименование без ОПФ. генерируется на основе full_with_opf, может содержать ошибки */
  full: string;
  /** Полное наименование без ОПФ. генерируется на основе short_with_opf, может содержать ошибки */
  short: string | null;
  /** Не заполняется */
  latin: string | null;
}

export interface PartyOpfInfo {
  /** Код ОКОПФ */
  code: string;
  /** Версия справочника ОКОПФ */
  type: string;
  /** Полное название ОПФ */
  full: string;
  /** Краткое название ОПФ */
  short: string;
}

export interface PartyManagementInfo {
  /** ФИО руководителя */
  name: string;
  /** Должность руководителя */
  post: string;
  /** `true`, если в состав руководства входят дисквалифицированные лица (19.7+, в данный момент не заполняется) */
  disqualified: null;
  /**
   * Дата вступления в должность (unix-время в миллисекундах). (24.9+)
   * @format int64
   */
  start_date: number | null;
}

export interface PartyStateInfo {
  /**
   * Дата актуальности сведений (unix-время в миллисекундах)
   * @format int64
   */
  actuality_date: number;
  /**
   * Дата регистрации (unix-время в миллисекундах)
   * @format int64
   */
  registration_date: number;
  /**
   * Дата ликвидации (unix-время в миллисекундах)
   * @format int64
   */
  liquidation_date: number | null;
  /**
   * Статус организации
   * - `ACTIVE`        действующая
   * - `LIQUIDATING`   ликвидируется
   * - `LIQUIDATED`    ликвидирована
   * - `REORGANIZING`  в процессе присоединения к другому юрлицу, с последующей ликвидацией
   * - `BANKRUPT`      банкрот (с февраля 2021)
   */
  status: PartyStatus;
  /**
   * Детальный статус (c декабря 2020) (часто не заполнен)
   * - {@link https://github.com/hflabs/party-state/blob/master/party-state.csv}
   */
  code: string | null;
}

export interface PartyFinance {
  /**
   * Система налогообложения (только в «Организация по ИНН», Тарифы «Расширенный» и «Максимальный»)
   * - `ESHN` — единый сельскохозяйственный налог (ЕСХН)
   * - `ENVD` — единый налог на вмененный доход для отдельных видов деятельности (ЕНВД)
   * - `SRP` — система налогообложения при выполнении соглашений о разделе продукции (СРП)
   * - `USN` — упрощенная система налогообложения (УСН)
   * - `AUSN` — автоматизированная упрощенная система налогообложения (АУСН)
   * - `USN_ENVD` — совмещение УСН и ЕНВД
   * - `ENVD_ESHN` — совмещение ЕНВД и ЕСХН
   */
  tax_system: TaxSystem | null;
  /**
   * Год бух. отчетности (только в «Организация по ИНН», Только «Максимальный» тариф, 21.3+)
   * @format int32
   */
  year: number | null;
  /**
   * Доходы по бух. отчетности, руб (Только «Максимальный» тариф)
   * - {@link https://dadata.ru/api/find-party/#finance}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669126#id-Объекторганизации-Доходыирасходы}
   */
  income: number | null;
  /** Выручка по бух. отчетности, руб (только в «Организация по ИНН», Только «Максимальный» тариф, 23.8+) */
  revenue: number | null;
  /**
   * Расходы по бух. отчетности, руб (только в «Организация по ИНН», Только «Максимальный» тариф)
   * - {@link https://dadata.ru/api/find-party/#finance}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669126#id-Объекторганизации-Доходыирасходы}
   */
  expense: number | null;
  /** Недоимки по налогам за позапрошлый год, руб (только в «Организация по ИНН», Только «Максимальный» тариф) */
  debt: number | null;
  /** Налоговые штрафы за позапрошлый год, руб (только в «Организация по ИНН», Только «Максимальный» тариф) */
  penalty: number | null;
}

export interface PartyOkvedInfo {
  /** Основной или нет */
  main: boolean;
  /** Версия справочника ОКВЭД (2001 или 2014) */
  type: OkvedType;
  /** Код по справочнику */
  code: string;
  /** Наименование по справочнику */
  name: string;
}

/**
 * `suggestion[ ].data` object, returned from 'suggest/party' API
 */
interface PartyBase {
  /** ИНН */
  inn: string;

  /**
   * ОГРН (13 цифр)
   * Для представительств иностранных компаний — номер записи об аккредитации (НЗА, 11 цифр) в РАФП.
   */
  ogrn: string;
  /**
   * Дата выдачи ОГРН. (unix-время в миллисекундах)
   * @format int64
   */
  ogrn_date: number;
  /** Внутренний идентификатор в Дадате */
  hid: string;
  /**
   * Тип организации
   * - `LEGAL` - юридическое лицо
   * - `INDIVIDUAL` - индивидуальный предприниматель
   */
  type: PartyType;

  /**
   * Наименование организации.  
   * Не заполняется в `findAffiliated/party`, только «Подсказки» и «Организация по ИНН»
   */
  name: PartyNameInfo;

  /** Код ОКПО */
  okpo: string | null;
  /** Код ОКАТО (20.9+) */
  okato: string | null;
  /** Код ОКТМО (20.9+) */
  oktmo: string | null;
  /** Код ОКОГУ (20.9+) */
  okogu: string | null;
  /** Код ОКФС (20.9+) */
  okfs: string | null;
  /** Код ОКВЭД */
  okved: string;
  /** Версия справочника ОКВЭД (2001 или 2014) */
  okved_type: OkvedType;
  /**
   * Организационно-правовая форма.  
   * Не заполняется в `findAffiliated/party`, только «Подсказки» и «Организация по ИНН»
   */
  opf: PartyOpfInfo;

  /** Подробности об адресе. Для юрлиц - о юридическом адресе, для ИП - о городе регистрации */
  address: PartyAddress;

  /** Состояние организации */
  state: PartyStateInfo;

  // === Дополнительные поля, заполняются только через метод «Организация по ИНН» ===

  /**
   * Среднесписочная численность работников
   * (только в «Организация по ИНН», Тарифы «Расширенный» и «Максимальный», 19.7+)
   */
  employee_count: number | null;
  /**
   * Коды ОКВЭД дополнительных видов деятельности
   * (только в «Организация по ИНН», Тарифы «Расширенный» и «Максимальный»)
   */
  okveds: PartyOkvedInfo[] | null;
  /**
   * Сведения о налоговой, ПФР и ФСС (только в «Организация по ИНН», Тарифы «Расширенный» и «Максимальный»)
   *
   * - `fts_registration` — ИФНС регистрации
   * - `fts_report` — ИФНС отчётности
   * - `pf` — Отделение Пенсионного фонда
   * - `sif` — Отделение Фонда соц. страхования
   */
  authorities: PartyAuthorities | null;

  /**
   * Налоговый режим, доходы, расходы, долги и штрафы (только в «Организация по ИНН», 19.7+)
   */
  finance: PartyFinance | null;
  /**
   * Документы и реестры (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  documents: PartyDocuments | null;
  /**
   * Лицензии (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  licenses: LicenseInfo[] | null;
  /**
   * Телефоны, заполнены у 60% действующих компаний (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  phones: PartyPhoneInfo[] | null;
  /**
   * Адреса эл. почты, заполнены у 50% действующих компаний (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  emails: PartyEmailInfo[] | null;

  /** Не заполняется */
  source: null;
  /** Не заполняется */
  qc: null;
}

export interface PartyLegal extends PartyBase {
  /**
   * Количество филиалов
   */
  branch_count: number | null;
  /**
   * Тип подразделения
   * - `MAIN` — головная организация
   * - `BRANCH` — филиал
   */
  branch_type: BranchType;
  /**
   * Уставной капитал компании (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  capital: PartyCapital | null;
  /**
   * Признак наличия недостоверных сведений (по решению суда, налоговой и некоторым другим причинам)
   * - {@link https://dadata.ru/api/find-party/#invalidity}
   *
   * Подробности об этом указываются в полях:
   * - `data.founders[ ].invalidity` - об учредителе
   * - `data.managers[ ].invalidity` - о руководителе
   * - `data.address[ ].invalidity` - об адресе
   *
   * Если хотя бы один учредитель, руководитель или адрес признан недостоверным,
   * «Дадата» вернет для организации в целом маркер `data.invalid = true`
   *
   * * Только «Максимальный» тариф */
  invalid: true | null;
  /**
   * КПП
   */
  kpp: string;
  /**
   * КПП крупнейшего налогоплательщика
   */
  kpp_largest: string | null;
  /**
   * Учредители компании (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  founders: PartyFounderLegal[] | PartyFounderPhysical[] | null;
  /**
   * Руководитель  
   * Не заполняется в `findAffiliated/party`, только «Подсказки» и «Организация по ИНН»
   */
  management: PartyManagementInfo | null;
  /**
   * Руководители компании (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  managers: PartyManagerLegal[] | PartyManagerPhysical[] | null;
  /**
   * Правопредшественники компании (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  predecessors: LinkedLegalEntity[] | null;
  /**
   * Правопреемники компании (только в «Организация по ИНН», Только «Максимальный» тариф)
   */
  successors: LinkedLegalEntity[] | null;
}

export interface PartyIndividual extends PartyBase {
  /**
   * Гражданство ИП (только в «Организация по ИНН», Тарифы «Расширенный» и «Максимальный»)
   */
  citizenship: PartyCitizenshipInfo | null;

  /**
   * ФИО индивидуального предпринимателя (21.3+)
   */
  fio: FioInfoBasic | null;
}

export interface PartyAuthoritiesItem {
  /** Код гос. органа */
  type: string;
  /** Код отделения */
  code: string;
  /** Наименование отделения */
  name: string;
  /** Адрес отделения одной строкой */
  address: string | null;
}

export type PartyAuthorities = {
  [key in 'fts_registration' | 'fts_report' | 'pf' | 'sif']: null | PartyAuthoritiesItem;
};

export interface PartyCitizenshipCode {
  /** Числовой код страны по ОКСМ */
  numeric: number;
  /** Трехбуквенный код страны по ОКСМ */
  alpha_3: string;
}

export interface PartyCitizenshipName {
  /** Полное название страны */
  full: string;
  /** Краткое название страны */
  short: string;
}

export interface PartyCitizenshipInfo {
  /** Числовой и буквенный код страны */
  code: PartyCitizenshipCode;
  /** Полное и краткое название страны */
  name: PartyCitizenshipName;
}

export interface FounderShare {
  /**
   * Тип значения для доли
   * - `PERCENT` - процент (пример: `75`)
   * - `DECIMAL` - десятичная дробь (пример: `0.75`)
   * - `FRACTION` - обычная дробь (пример: `3/4`)
   */
  type: 'PERCENT' | 'DECIMAL' | 'FRACTION';
  /**
   * Значение доли. Для процентных и десятичных (type = `PERCENT` и type = `DECIMAL`)
   */
  value?: number;
  /**
   * Числитель дроби у доли (для type = `FRACTION`)
   * @format int64
   */
  numerator?: number;
  /**
   * Знаменатель дроби у доли (для type = `FRACTION`)
   * @format int64
   */
  denominator?: number;
}

interface PartyFounder {
  /** Внутренний идентификатор в Дадате */
  hid: string | null;

  /** ИНН учредителя */
  inn: string | null;

  /**
   * Недостоверность сведений об учредителе
   * - {@link https://dadata.ru/api/find-party/#invalidity}
   */
  invalidity: InvalidityInfo | null;

  /** Доля учредителя */
  share: FounderShare | null;

  /**
   * Дата вступления в права учредителя (unix-время в миллисекундах)
   * @format int64
   */
  start_date: number | null;

  /** Тип учредителя (`LEGAL` - юрлицо / `PHYSICAL` - физлицо) */
  type: 'LEGAL' | 'PHYSICAL' | null;
}

export interface PartyFounderLegal extends PartyFounder {
  /** ОГРН учредителя */
  ogrn: string | null;

  /** Наименование учредителя */
  name: string | null;
}

export interface PartyFounderPhysical extends PartyFounder {
  /** ФИО учредителя */
  fio: FioInfoExtra | null;
}

interface PartyManager {
  /** ИНН руководителя */
  inn: string | null;

  /** Тип руководителя. `EMPLOYEE` — сотрудник, `LEGAL` — юрлицо */
  type: 'EMPLOYEE' | 'LEGAL';

  /**
   * Недостоверность сведений о руководителе
   * - {@link https://dadata.ru/api/find-party/#invalidity}
   */
  invalidity: InvalidityInfo | null;

  /**
   * Дата вступления в должность руководителя (unix-время в миллисекундах)
   * @format int64
   */
  start_date: number | null;

  /** Внутренний идентификатор в Дадате */
  hid: string | null;
}

export interface PartyManagerLegal extends PartyManager {
  /** ОГРН руководителя (для юрлиц) */
  ogrn: string | null;

  /** Наименование руководителя (для юрлиц) */
  name: string | null;
}

export interface PartyManagerPhysical extends PartyManager {
  /** ФИО руководителя (для физлиц) */
  fio: FioInfoExtra | null;

  /** Должность руководителя (для физлиц) */
  post: string | null;
}

export interface PartyCapital {
  /** Тип капитала */
  type: string;
  /** Размер капитала */
  value: number;
}

export interface PartyDocuments {
  /** Свидетельство о регистрации в налоговой */
  fts_registration: DocumentInfoFtsReg | null;
  /** Сведения об учете в налоговом органе */
  fts_report: DocumentInfoFtsReport | null;
  /** Свидетельство о регистрации в Пенсионном фонде */
  pf_registration: DocumentInfoPfReg | null;
  /** Свидетельство о регистрации в Фонде соц. страхования */
  sif_registration: DocumentInfoSifReg | null;
  /** Запись в реестре малого и среднего предпринимательства */
  smb: DocumentInfoSmb | null;
}

export interface CourtDecisionInfo {
  /** Наименование суда */
  court_name: string | null;
  /** Номер судебного решения */
  number: string | null;
  /**
   * Дата судебного решения (unix-время в миллисекундах)
   * @format int64
   */
  date: number | null;
}

export interface InvalidityInfo {
  /**
   * Код причины недостоверности
   * - `PARTY`  — обращение лица или организации
   * - `FTS`    — проверка налоговой
   * - `COURT`  — решение суда
   * - `OTHER`  — прочие причины
   */
  code: 'PARTY' | 'FTS' | 'COURT' | 'OTHER';
  /** Решение суда (только для code = `COURT`) */
  decision?: null | CourtDecisionInfo;
}

export interface FioInfoBasic {
  /** Фамилия */
  surname: string | null;
  /** Имя */
  name: string | null;
  /** Отчество */
  patronymic: string | null;
  /** Не заполняется */
  gender: null;
  /** Не заполняется */
  qc: null;
  /** Не заполняется */
  source: null;
}

export interface FioInfoExtra extends Override<
  FioInfoBasic,
  {
    /** Пол */
    gender: FioGenders;
    /** Исходная запись */
    source: string | null;
  }
> {}

export interface LinkedLegalEntity {
  /** ОГРН предшественника (`predecessors`) или преемника (`successors`) */
  ogrn: string;
  /** ИНН предшественника (`predecessors`) или преемника (`successors`) */
  inn: string;
  /** Наименование предшественника (`predecessors`) или преемника (`successors`) */
  name: string;
}

interface DocumentInfo<
  T extends string =
    'FTS_REGISTRATION' | 'FTS_REPORT' | 'PF_REGISTRATION' | 'SIF_REGISTRATION' | 'SMB',
> {
  /** Тип документа */
  type: T;
  /** Серия документа */
  series: string | null;
  /** Номер документа */
  number: string | null;
  /**
   * Дата выдачи / регистрациии (unix-время в миллисекундах)
   * @format int64
   */
  issue_date: number | null;
  /** Серия документа */
  issue_authority: string | null;
}

export interface DocumentInfoSmb extends DocumentInfo<'SMB'> {
  /**
   * Категория предприятия:
   * - `MICRO` — микро-предприятие
   * - `SMALL` — малое предприятие
   * - `MEDIUM` — среднее предприятие
   */
  category: 'MICRO' | 'SMALL' | 'MEDIUM';
  /** Не заполняется */
  series: null;
  /** Не заполняется */
  number: null;
  /** Не заполняется */
  issue_authority: null;
}

export type DocumentInfoFtsReg = DocumentInfo<'FTS_REGISTRATION'>;
export type DocumentInfoFtsReport = DocumentInfo<'FTS_REPORT'>;
export type DocumentInfoPfReg = DocumentInfo<'PF_REGISTRATION'>;
export type DocumentInfoSifReg = DocumentInfo<'SIF_REGISTRATION'>;

export interface LicenseInfo {
  /** Серия документа */
  series: string | null;
  /** Номер документа */
  number: string | null;
  /**
   * Дата выдачи (unix-время в миллисекундах)
   * @format int64
   */
  issue_date: number | null;
  /** Название выдавшего органа */
  issue_authority: string | null;
  /**
   * Дата приостановки (unix-время в миллисекундах)
   * @format int64
   */
  suspend_date: number | null;
  /** Название приостановившего органа */
  suspend_authority: string | null;
  /**
   * Дата начала действия (unix-время в миллисекундах)
   * @format int64
   */
  valid_from: number | null;
  /**
   * Дата окончания действия (unix-время в миллисекундах)
   * @format int64
   */
  valid_to: number | null;
  /** Перечень лицензируемых видов деятельности */
  activities: string[] | null;
  /** Перечень адресов, по которым действует лицензия */
  addresses: string[] | null;
}

export interface PartyPhoneContact {
  /**
   * Тип контактного лица
   * - `MANAGING_PARTY` - управляющая организация
   * - `TRUSTED_EMPLOYEE` - сотрудник
   * - `TRUSTED_FOREIGNER` - иностранный гражданин
   */
  type: string | null;
  /** Имя контактного лица */
  name: string | null;
}

export interface PartyPhoneInfoData {
  /** Телефон одной строкой как в ЕГРЮЛ */
  source: string;
  /**
   * Тип телефона, например:
   * - Мобильный  - `+7 911 243-45-68`
   * - Стационарный - `+7 495 456-55-77`
   * - Прямой мобильный - `+7 495 243-45-68`
   * - Колл-центр - `8 800 222-12-22`
   * - Неизвестный  - `+7 333 1111112`
   */
  type: string | null;
  /** Телефонный код страны (например `7`) */
  country_code: string | null;
  /** Телефонный код города / DEF-код */
  city_code: string | null;
  /** Локальная часть номера телефона */
  number: string | null;
  /** Оператор связи (например, `ПАО "Вымпел-Коммуникации"`) */
  provider: string | null;
  /** Страна */
  country: string | null;
  /** Регион (например, `Москва`)  */
  region: string | null;
  /** Город (только для стационарных телефонов) */
  city: string | null;
  /** Часовой пояс города (Россия), страны (прочие страны), например, `UTC+3` */
  timezone: string | null;
  /** Контактное лицо */
  contact: null | PartyPhoneContact;
  /** Добавочный номер */
  extension: string | null;
  /** Не заполняется */
  qc_conflict: null;
  /** Не заполняется */
  qc: null;
}

export interface PartyPhoneInfo {
  /** Телефон организации одной строкой */
  value: string;
  /** Телефон организации одной строкой (то же, что и value) */
  unrestricted_value: string;
  /** Подробности о телефоне организации */
  data: PartyPhoneInfoData;
}

export interface PartyEmailInfoData {
  /** Локальная часть адреса (то, что до «собачки») */
  local: string;
  /** Домен (то, что после «собачки») */
  domain: string;
  /** Не заполняется */
  type: null;
  /** Email адрес, указанный в ЕГРЮЛ (может содержать несколько адресов через запятую) */
  source: string | null;
  /** Не заполняется */
  qc: null;
}

export interface PartyEmailInfo {
  /** Email одной строкой. Если в ЕГРЮЛ несколько email - здесь, вероятно, будет первый */
  value: string;
  /** Email одной строкой (то же, что value) */
  unrestricted_value: string;
  /** Подробности об email-адресе */
  data: PartyEmailInfoData;
}

export type OkvedType = '2001' | '2014';

export type TaxSystem = 'ESHN' | 'ENVD' | 'SRP' | 'USN' | 'AUSN' | 'USN_ENVD' | 'ENVD_ESHN';

/**
 * @see https://dadata.ru/api/find-company/by-email/
 */
export interface PartyByEmailCompanyInfo {
  /**
   * Домен компании
   * @example 'dadata.ru'
   */
  domain: string;
  /**
   * Краткое наименование компании
   * @example 'ООО "ДЕЙТА КЬЮ"'
   */
  name: string;
  /**
   * ИНН компании
   * @example '7721581040'
   */
  inn: string | null;
  /**
   * ОГРН компании
   * @example '5077746329876'
   */
  ogrn: string | null;
  /**
   * Основной код ОКВЭД
   * @example '63.11'
   */
  okved: string | null;
  /**
   * Расшифровка кода ОКВЭД
   * @example 'Деятельность по обработке данных ... и связанная с этим деятельность'
   */
  okved_name: string | null;
  /**
   * Среднесписочная численность работников (заполнена для 65% компаний)
   * @format int32
   * @example 10
   */
  employee_count: number | null;
  /**
   * Доходы за год по открытой бух. отчётности (заполнены для 65% компаний)
   * @example 204250000
   */
  income: number | null;
  /**
   * Город регистрации
   * @example 'Москва'
   */
  city: string | null;
  /**
   * Часовой пояс
   * @example 'UTC+3'
   */
  timezone: string | null;
}

/**
 * @see https://dadata.ru/api/find-company/by-email/
 */
export interface PartyByEmailSuggestionData {
  /** Подробности об имейл-адресе из запроса */
  email: PartyByEmailEmailData;
  /** Подробности об организации, если найдена (если нет - `null`) */
  company: PartyByEmailCompanyInfo | null;
}

/**
 * @see https://dadata.ru/api/find-company/by-email/
 */
export interface PartyByEmailSuggestion {
  /** Email одной строкой */
  value: string;
  /** = value */
  unrestricted_value: string;
  /** Подробности об имейле и о компании */
  data: PartyByEmailSuggestionData;
}

export type SuggestPartyResponse = SuggestionsResponse<PartySuggestion>;
export type FindPartyByEmailResponse = SuggestionsResponse<PartyByEmailSuggestion>;
