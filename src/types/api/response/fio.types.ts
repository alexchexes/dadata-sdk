import type { FioGenders } from '../api-common.types';

/** Fields of 'data' object (suggestions[i].data) in 'Suggest' API {@link https://dadata.ru/api/suggest/name/} */
export interface FioData {
  /** Фамилия */
  surname: null | string;
  /** Имя */
  name: null | string;
  /** Отчество */
  patronymic: null | string;
  /**
   * Пол:
   * - `MALE` - мужской
   * - `FEMALE` - женский
   * - `UNKNOWN` - не удалось однозначно определить
   */
  gender: FioGenders;
  /**
   * Код проверки:
   * - `0` – все части ФИО известны
   * - `1` – в ФИО есть неизвестная часть
   */
  qc: '0' | '1';
  /** Не используется */
  source: null | string;
}

/** Object returned from FIO 'Standartization' API {@link https://dadata.ru/api/clean/name/} */
export interface FioStandardized {
  /** Исходное ФИО одной строкой */
  source: string;
  /** Стандартизованное ФИО одной строкой */
  result: string;
  /**  в родительном падеже */
  result_genitive: null | string;
  /** ФИО в дательном падеже */
  result_dative: null | string;
  /** ФИО в творительном падеже */
  result_ablative: null | string;
  /** Фамилия */
  surname: null | string;
  /** Имя */
  name: null | string;
  /** Отчество */
  patronymic: null | string;
  /**
   * Пол (Значение - Кириллицей):
   * - `М` - мужской
   * - `Ж` - женский
   * - `НД` - не удалось однозначно определить
   */
  gender: 'М' | 'Ж' | 'НД';
  /**
   * Код проверки {@link https://dadata.ru/api/clean/name/#qc}
   *
   * Требуется ли вручную проверить распознанное значение:
   * | Код | Нужно проверить вручную? | Описание |
   * |-|-|-|
   * | 0 | Нет | Исходное значение распознано уверенно |
   * | 1 | Да  | Исходное значение распознано с допущениями или не распознано |
   * | 2 | Нет | Исходное значение пустое или заведомо «мусорное» |
   */
  qc: 0 | 1;
}
