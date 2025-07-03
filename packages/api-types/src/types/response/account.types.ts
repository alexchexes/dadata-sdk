// --------------------------
//  ProfileBalanceResponse
// --------------------------

/**
 * Ответ из API "Баланс пользователя"
 * @see https://dadata.ru/api/balance/
 */
export interface ProfileBalanceResponse {
  /**
   * Баланс в рублях
   * @example 9922.30
   */
  balance: number;
}

// --------------------------
// DailyStats
// --------------------------

/**
 * Ответ из API "Статистика использования"
 * @see https://dadata.ru/api/stat/
 */
export interface DailyStats {
  /**
   * Текущая дата
   * @example '2023-05-23'
   */
  date: string;
  /** Суммарное количество запросов, израсходованное по каждому сервису с начала суток */
  services: DailyStatsServices;
  /**
   * Расчетное количество оставшихся запросов согласно балансу и тарифу.
   *
   * Например, если баланс составляет `150 ₽`, то, согласно тарифам «Дадаты», его достаточно для:
   *
   * - 7500 записей «Поиска дублей»;
   * - или 750 записей «Стандартизации»;
   * - или 21 запросов «Компаний по емейлу».
   *
   * То есть количества в `remaining.clean`, `remaining.company` и `remaining.merging` — взаимоисключающие. Именно это и отражает пример выше.
   *
   * Количество в `remaining.suggestions` рассчитывается из тарифного плана и не зависит от баланса.
   */
  remaining: DailyStatsRemaining;
}

export interface DailyStatsServices {
  /** Кол-во запросов к "Стандартизации" с начала суток */
  clean: number;
  /** Кол-во запросов к сервису "Компания по Email" с начала суток */
  company: number;
  /** Кол-во обработанных записей в сервисе "Поиск дублей" с начала суток */
  merging: number;
  /** Кол-во запросов к "Подсказкам" с начала суток */
  suggestions: number;

  // /** Кол-во запросов к сервису "Похожие компании" {@link https://dadata.ru/lookalike/} */
  // company_similar: number;
  // NOT RELEASED YET
}

export interface DailyStatsRemaining {
  /** Расчётное количество оставшихся запросов "Стандартизации" */
  clean: number;
  /** Расчётное количество оставшихся запросов "Компаний по емейлу" */
  company: number;
  /** Расчётное кол-во оставшихся записей в сервисе "Поиск дублей" */
  merging: number;
  /** Расчётное количество оставшихся запросов к "Подсказкам" */
  suggestions: number;

  // /** Расчётное количество оставшихся запросов к сервису "Похожие компании" {@link https://dadata.ru/lookalike/} */
  // company_similar: number;
  // NOT RELEASED YET
}

// --------------------------
// ServiceVersions
// --------------------------

/**
 * Ответ из API "Версии справочников"
 * @see https://dadata.ru/api/version/
 */
export interface ServiceVersions {
  /** Сведения о версии бэк-энда «Дадаты» */
  dadata: ServiceVersionsDadata;
  /** Сведения о версиях "Стандартизации" */
  factor: ServiceVersionsFactor;
  /** Сведения о версиях "Подсказок" */
  suggestions: ServiceVersionsSuggestions;
}

export interface ServiceVersionsDadata {
  /**
   * Версия бэк-энда «ДаДаты»
   * @example 'stable (14385:607a88c61a1e)'
   */
  version: string;
}

export interface ServiceVersionsFactor {
  /**
   * Версия бэк-энда сервиса Стандартизации
   * @example '25.4.85497 (5bd0bdda)'
   * @example 'feature-DADATA-3839-25.4-SNAPSHOT (d8a5f29b)'
   */
  version: string;
  /** Даты актуальности используемых источников данных в формате `'ДД.ММ.ГГГГ'` */
  resources: ServiceVersionsFactorResources;
}

export interface ServiceVersionsFactorResources {
  'Перенесённые номера': string;
  'ФИАС': string;
  'Геокоординаты': string;
  'Площади квартир': string;
  'Недейств. паспорта': string;
  'Цены квартир': string;
  'Телефоны': string;
  'Индексы Почты': string;
}

export interface ServiceVersionsSuggestions {
  /**
   * Версия бэк-энда сервиса Подсказок
   * @example '25.5 (412a3f5c)'
   */
  version: string;
  /** Даты актуальности используемых источников данных в формате `'ДД.ММ.ГГГГ'` */
  resources: ServiceVersionsSuggestionsResources;
}
export interface ServiceVersionsSuggestionsResources {
  'ГАР': string;
  'IP-адреса': string;
  'Банки': string;
  'ФИАС': string;
  'ЕГРЮЛ': string;
  'ЕГРЮЛ Беларусь': string;
  'ЕГРЮЛ Казахстан': string;
}
