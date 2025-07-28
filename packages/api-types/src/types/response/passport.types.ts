import type { CleanResponse } from './clean.types';

/**
 * Проверка паспорта по базе ФМС/МВД
 * @see https://dadata.ru/api/clean/passport/
 */
export interface PassportClean {
  /**
   * @example '4509 235857'
   */
  source: string;
  /**
   * @example '45 09'
   */
  series: string | null;
  /**
   * @example '235857'
   */
  number: string | null;
  /**
   * Код проверки
   *
   * Действует паспорт или нет, по данным Федеральной миграционной службы
   *
   * | Код | Описание                             | Проверить? |
   * | --- | ------------------------------------ | ---------- |
   * | 0   | Действующий паспорт                  | нет        |
   * | 2   | Исходное значение пустое             | нет        |
   * | 1   | Неправильный формат серии или номера | да         |
   * | 10  | Недействительный паспорт             | да         |
   */
  qc: 0 | 1 | 2 | 10;
}

export type CleanPassportResponse = CleanResponse<PassportClean>;
