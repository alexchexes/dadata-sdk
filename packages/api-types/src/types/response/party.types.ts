import type {
  BranchType,
  FioGenders,
  PartyStatus,
  PartyType,
  SuggestionsResponse,
} from '../common.types';
import type { Override } from '../helpers.types';
import type { PartySuggestionAddressData } from './address.types';
import type { EmailSuggestionData } from './email.types';

/**
 * Generic suggestion object returned from 'suggest/party' or 'findById/party' APIs
 */
export interface BasePartySuggestion<T = RichPartySuggestionData | PartySuggestionData> {
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
  data: T;
}

/**
 * Suggestion object returned from 'suggest/party' API
 * - {@link https://dadata.ru/api/suggest/party}
 * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669122}
 */
export interface PartySuggestion extends BasePartySuggestion<PartySuggestionData> {}

/**
 * Suggestion object returned from 'findById/party' API
 * - {@link https://dadata.ru/api/find-party/}
 * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058}
 */
export interface RichPartySuggestion extends BasePartySuggestion<RichPartySuggestionData> {}

/**
 * Suggestion object returned from 'findAffiliated/party' API endpoint
 * @see https://dadata.ru/api/find-affiliated/
 */
export interface PartyAffiliatedSuggestion extends BasePartySuggestion<PartyAffiliatedData> {}

/**
 * `data.address` object returned from 'suggest/party' API
 */
export interface PartySuggestionDataAddressBasic {
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
  /** Недостоверность сведений об адресе (только в «Организация по ИНН») */
  invalidity: null;
  /** Подробности об адресе организации */
  data: PartySuggestionAddressData;
}

/**
 * `data.address` object returned from 'findById/party' API
 */
export interface PartySuggestionDataAddressExtra
  extends Override<
    PartySuggestionDataAddressBasic,
    {
      /**
       * Недостоверность сведений об адресе (Только «Максимальный» тариф)
       * - {@link https://dadata.ru/api/find-party/#invalidity}
       */
      invalidity: InvalidityInfo | null;
    }
  > {}

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
  /** Дата вступления в должность (unix-время в миллисекундах). (24.9+) */
  start_date: number | null;
}

export interface PartyStateInfo {
  /** Дата актуальности сведений (unix-время в миллисекундах) */
  actuality_date: number;
  /** Дата регистрации (unix-время в миллисекундах) */
  registration_date: number;
  /** Дата ликвидации (unix-время в миллисекундах) */
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

export interface PartyFinanceInfoBasic {
  /** Система налогообложения (только в «Организация по ИНН») */
  tax_system: null;
  /** Год бух. отчетности (только в «Организация по ИНН») */
  year: null;
  /** Доходы по бух. отчетности (только в «Организация по ИНН») */
  income: null;
  /** Выручка по бух. отчетности (только в «Организация по ИНН») */
  revenue: null;
  /** Расходы по бух. отчетности (только в «Организация по ИНН») */
  expense: null;
  /** Недоимки по налогам (только в «Организация по ИНН») */
  debt: null;
  /** Налоговые штрафы (только в «Организация по ИНН») */
  penalty: null;
}

export interface PartyFinanceInfoExtra {
  /**
   * Система налогообложения (Тарифы «Расширенный» и «Максимальный»)
   * - `AUSN` — автоматизированная упрощенная система налогообложения (АУСН)
   * - `ESHN` — единый сельскохозяйственный налог (ЕСХН)
   * - `SRP` — система налогообложения при выполнении соглашений о разделе продукции (СРП)
   * - `USN` — упрощенная система налогообложения (УСН)
   */
  tax_system: string | null;
  /** Год бух. отчетности (Только «Максимальный» тариф, 21.3+) */
  year: number | null;
  /**
   * Доходы по бух. отчетности, руб (Только «Максимальный» тариф)
   * - {@link https://dadata.ru/api/find-party/#finance}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669126#id-Объекторганизации-Доходыирасходы}
   */
  income: number | null;
  /** Выручка по бух. отчетности, руб (Только «Максимальный» тариф, 23.8+) */
  revenue: number | null;
  /**
   * Расходы по бух. отчетности, руб (Только «Максимальный» тариф)
   * - {@link https://dadata.ru/api/find-party/#finance}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669126#id-Объекторганизации-Доходыирасходы}
   */
  expense: number | null;
  /** Недоимки по налогам за позапрошлый год, руб (Только «Максимальный» тариф) */
  debt: number | null;
  /** Налоговые штрафы за позапрошлый год, руб (Только «Максимальный» тариф) */
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
export interface PartySuggestionData {
  /** ИНН */
  inn: string;
  /** КПП */
  kpp?: string;
  /** Не заполняется */
  kpp_largest?: null;
  /**
   * ОГРН (13 цифр)
   * Для представительств иностранных компаний — номер записи об аккредитации (НЗА, 11 цифр) в РАФП.
   */
  ogrn: string;
  /** Дата выдачи ОГРН. (unix-время в миллисекундах) */
  ogrn_date: number;
  /** Внутренний идентификатор в Дадате */
  hid: string;
  /**
   * Тип организации
   * - `LEGAL` - юридическое лицо
   * - `INDIVIDUAL` - индивидуальный предприниматель
   */
  type: PartyType;

  /** Наименование организации */
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
  /** Организационно-правовая форма */
  opf: PartyOpfInfo;

  /**
   * Признак наличия недостоверных сведений (по решению суда, налоговой и некоторым другим причинам; только для юрлиц)
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
  invalid?: true | null;

  /** Руководитель (только для юрлиц) */
  management?: null | PartyManagementInfo;

  /** Количество филиалов (только для юрлиц) */
  branch_count?: number;

  /**
   * Тип подразделения (только для юрлиц)
   * - `MAIN` — головная организация
   * - `BRANCH` — филиал
   */
  branch_type?: BranchType;

  /** Подробности об адресе. Для юрлиц - о юридическом адресе, для ИП - о городе регистрации */
  address: PartySuggestionDataAddressBasic;

  /** Состояние организации */
  state: PartyStateInfo;
  /** ФИО индивидуального предпринимателя (21.3+) */
  fio?: null | FioInfoBasic;

  // === Дополнительные поля, заполняются только через метод «Организация по ИНН» ===

  /** Среднесписочная численность работников (только в «Организация по ИНН») */
  employee_count: null;
  /** Коды ОКВЭД дополнительных видов деятельности (только в «Организация по ИНН») */
  okveds: null;
  /** Сведения о налоговой, ПФР и ФСС (только в «Организация по ИНН») */
  authorities: null;
  /** Гражданство ИП (только в «Организация по ИНН») */
  citizenship?: null;
  /** Учредители компании, только для юрлиц (только в «Организация по ИНН») */
  founders?: null;
  /** Руководители компании, только для юрлиц (только в «Организация по ИНН») */
  managers?: null;
  /** Правопредшественники компании, только для юрлиц (только в «Организация по ИНН») */
  predecessors?: null;
  /** Правопреемники компании, только для юрлиц (только в «Организация по ИНН») */
  successors?: null;
  /** Уставной капитал компании, только для юрлиц (только в «Организация по ИНН») */
  capital?: null;
  /** Налоговый режим, доходы, расходы, долги и штрафы (только в «Организация по ИНН») */
  finance: null | PartyFinanceInfoBasic;
  /** Документы и реестры (только в «Организация по ИНН») */
  documents: null;
  /** Лицензии (только в «Организация по ИНН») */
  licenses: null;
  /** Телефоны (только в «Организация по ИНН») */
  phones: null;
  /** Адреса эл. почты (только в «Организация по ИНН») */
  emails: null;

  /** Не заполняется */
  source: null;
  /** Не заполняется */
  qc: null;
}

/**
 * @see https://dadata.ru/api/find-affiliated
 */
export interface PartyAffiliatedData
  extends Override<
    PartySuggestionData,
    {
      /** Не заполняется, используйте метод "Организация по ИНН" (`findById/party`) */
      management: null;
      /** Не заполняется, используйте метод "Организация по ИНН" (`findById/party`) */
      opf: null;
      /** Не заполняется, используйте метод "Организация по ИНН" (`findById/party`) */
      name: null;
    }
  > {}

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

export interface PartyFounderShare {
  /**
   * Тип значения для доли
   * - `PERCENT` - процент (пример: `75`)
   * - `DECIMAL` - десятичная дробь (пример: `0.75`)
   * - `FRACTION` - обычная дробь (пример: `3/4`)
   */
  type: 'PERCENT' | 'DECIMAL' | 'FRACTION';
  /** Значение доли. Для процентных и десятичных (type = `PERCENT` и type = `DECIMAL`) */
  value?: number;
  /** Числитель дроби у доли (для type = `FRACTION`) */
  numerator?: number;
  /** Знаменатель дроби у доли (для type = `FRACTION`) */
  denominator?: number;
}

export interface PartyFounder {
  /** ОГРН учредителя (для юрлиц) */
  ogrn?: null | string;
  /** ИНН учредителя */
  inn: null | string;
  /** Наименование учредителя (для юрлиц) */
  name?: null | string;
  /** ФИО учредителя (для физлиц) */
  fio?: null | FioInfoExtra;
  /** Внутренний идентификатор в Дадате */
  hid: null | string;
  /** Тип учредителя (`LEGAL` - юрлицо / `PHYSICAL` - физлицо) */
  type: null | 'LEGAL' | 'PHYSICAL';
  /** Доля учредителя */
  share: null | PartyFounderShare;
  /**
   * Недостоверность сведений об учредителе
   * - {@link https://dadata.ru/api/find-party/#invalidity}
   */
  invalidity: InvalidityInfo | null;
  /** Дата вступления в права учредителя (unix-время в миллисекундах) */
  start_date: number | null;
}

export interface PartyManager {
  /** ОГРН руководителя (для юрлиц) */
  ogrn?: string | null;
  /** ИНН руководителя */
  inn: string | null;
  /** Наименование руководителя (для юрлиц) */
  name?: string | null;
  /** ФИО руководителя (для физлиц) */
  fio?: FioInfoExtra | null;
  /** Должность руководителя (для физлиц) */
  post?: string | null;
  /** Внутренний идентификатор в Дадате */
  hid: string | null;
  /** Тип руководителя. `EMPLOYEE` — сотрудник, `LEGAL` — юрлицо */
  type: 'EMPLOYEE' | 'LEGAL';
  /**
   * Недостоверность сведений о руководителе
   * - {@link https://dadata.ru/api/find-party/#invalidity}
   */
  invalidity: null | InvalidityInfo;
  /** Дата вступления в должность руководителя (unix-время в миллисекундах) */
  start_date: number | null;
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

/**
 * `suggestion[ ].data` object, returned from 'findById/party' API
 */
export interface RichPartySuggestionData
  extends Override<
    PartySuggestionData,
    {
      /** Среднесписочная численность работников (Тарифы «Расширенный» и «Максимальный», 19.7+) */
      employee_count: number | null;

      /** Коды ОКВЭД дополнительных видов деятельности (Тарифы «Расширенный» и «Максимальный») */
      okveds: null | PartyOkvedInfo[];

      /**
       * Сведения о налоговой, ПФР и ФСС (Тарифы «Расширенный» и «Максимальный»)
       *
       * - `fts_registration` — ИФНС регистрации
       * - `fts_report` — ИФНС отчётности
       * - `pf` — Отделение Пенсионного фонда
       * - `sif` — Отделение Фонда соц. страхования
       */
      authorities: null | PartyAuthorities;

      /** Гражданство ИП (Тарифы «Расширенный» и «Максимальный») */
      citizenship?: null | PartyCitizenshipInfo;

      /** Учредители компании (Только «Максимальный» тариф) */
      founders?: null | PartyFounder[];

      /** Руководители компании, только для юрлиц (Только «Максимальный» тариф) */
      managers?: null | PartyManager[];

      /** Правопредшественники компании, только для юрлиц (Только «Максимальный» тариф) */
      predecessors?: LinkedLegalEntity[] | null;

      /** Правопреемники компании, только для юрлиц (Только «Максимальный» тариф) */
      successors?: LinkedLegalEntity[] | null;

      /** Уставной капитал компании, только для юрлиц (Только «Максимальный» тариф) */
      capital?: null | PartyCapital;

      /** Налоговый режим, доходы, расходы, долги и штрафы (19.7+) */
      finance: null | PartyFinanceInfoExtra;

      /** Документы и реестры (Только «Максимальный» тариф) */
      documents: null | PartyDocuments;

      /** Лицензии (Только «Максимальный» тариф) */
      licenses: LicenseInfo[] | null;

      /** Телефоны, заполнены у 60% действующих компаний (Только «Максимальный» тариф) */
      phones: PartyPhoneInfo[] | null;

      /** Адреса эл. почты, заполнены у 50% действующих компаний (Только «Максимальный» тариф) */
      emails: PartyEmailInfo[] | null;

      /** Подробности об адресе организации / о городе ИП */
      address: PartySuggestionDataAddressExtra;
    }
  > {}

export interface CourtDecisionInfo {
  /** Наименование суда */
  court_name: string | null;
  /** Номер судебного решения */
  number: string | null;
  /** Дата судебного решения (unix-время в миллисекундах) */
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

export interface FioInfoExtra
  extends Override<
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
    | 'FTS_REGISTRATION'
    | 'FTS_REPORT'
    | 'PF_REGISTRATION'
    | 'SIF_REGISTRATION'
    | 'SMB',
> {
  /** Тип документа */
  type: T;
  /** Серия документа */
  series: string | null;
  /** Номер документа */
  number: string | null;
  /** Дата выдачи / регистрациии (unix-время в миллисекундах) */
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
  /** Дата выдачи (unix-время в миллисекундах) */
  issue_date: number | null;
  /** Название выдавшего органа */
  issue_authority: string | null;
  /** Дата приостановки (unix-время в миллисекундах) */
  suspend_date: number | null;
  /** Название приостановившего органа */
  suspend_authority: string | null;
  /** Дата начала действия (unix-время в миллисекундах) */
  valid_from: number | null;
  /** Дата окончания действия (unix-время в миллисекундах) */
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
  email: EmailSuggestionData;
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
export type FindPartyResponse = SuggestionsResponse<RichPartySuggestion>;
export type FindPartyByEmailResponse = SuggestionsResponse<PartyByEmailSuggestion>;
export type FindAffiliatedResponse = SuggestionsResponse<PartyAffiliatedSuggestion>;
