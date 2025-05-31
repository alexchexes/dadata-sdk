import type { OneOrMany, FioGenders, FioParts } from '@dadata-sdk/api-types';
import type { BaseSuggestOptions } from './suggest-options.types';

/** Additional options passed in the same form as in suggest/fio request payload */
export interface SuggestFioOptions extends BaseSuggestOptions {
  suggestType: 'fio';
  /** Пол (`UNKNOWN` / `MALE` / `FEMALE`) */
  fioGender?: FioGenders;

  /**
   * Подсказки по части ФИО (строка или массив)
   * - Только имена: `['NAME']` или `NAME`
   * - Имена и отчества: `['NAME', 'PATRONYMIC']`
   * - Имена и фамилии: `['NAME', 'SURNAME']`
   */
  fioParts?: OneOrMany<FioParts>;
}
