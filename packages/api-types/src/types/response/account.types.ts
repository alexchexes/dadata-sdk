// --------------------------
//  AccountBalance
// --------------------------

/**
 * Ответ из API "Баланс пользователя"
 * @see https://dadata.ru/api/balance/
 */
export interface AccountBalance {
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
  /** Кол-во запросов к "Компания по Email" с начала суток */
  company: number;
  merging: number;
  /** Кол-во запросов к "Подсказкам" с начала суток */
  suggestions: number;
}

export interface DailyStatsRemaining {
  /** Расчётное количество оставшихся запросов "Стандартизации" */
  clean: number;
  /** Расчётное количество оставшихся запросов "Компаний по емейлу" */
  company: number;
  merging: number;
  /** Расчётное количество оставшихся запросов к "Подсказкам" */
  suggestions: number;
}

// --------------------------
// ServiceVersions
// --------------------------

/**
 * Ответ из API "Версии справочников"
 * @see https://dadata.ru/api/version/
 */
export interface ServiceVersions {
  dadata: ServiceVersionsDadata;
  /** Сведения о версиях "Стандартизации" */
  factor: ServiceVersionsFactor;
  /** Сведения о версиях "Подсказок" */
  suggestions: ServiceVersionsSuggestions;
}

export interface ServiceVersionsDadata {
  /**
   * @example 'stable (14385:607a88c61a1e)'
   */
  version: string;
}

export interface ServiceVersionsFactor {
  /**
   * @example '25.4.85497 (5bd0bdda)'
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
