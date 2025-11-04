import type {
  BRANCH_TYPES,
  FIO_GENDERS,
  PARTY_BY_STATUSES,
  PARTY_BY_TYPES,
  PARTY_KZ_STATUSES,
  PARTY_KZ_TYPES,
  PARTY_STATUSES,
  PARTY_TYPES,
} from '../constants';

export type FioGenders = (typeof FIO_GENDERS)[number];

export type PartyType = (typeof PARTY_TYPES)[number];
export type PartyStatus = (typeof PARTY_STATUSES)[number];
export type BranchType = (typeof BRANCH_TYPES)[number];

export type PartyByType = (typeof PARTY_BY_TYPES)[number];
export type PartyByStatus = (typeof PARTY_BY_STATUSES)[number];

export type PartyKzType = (typeof PARTY_KZ_TYPES)[number];
export type PartyKzStatus = (typeof PARTY_KZ_STATUSES)[number];

export type FmsUnitType = '0' | '1' | '2' | '3';

/**
 * Объект с массивом подсказок
 */
export type SuggestionsResponse<T> = {
  /** Массив подсказок или пустой массив */
  suggestions: T[];
};

/**
 * Тип суда
 *
 * - `AV` — Апелляционный военный суд
 * - `AJ` — Апелляционный суд общей юрисдикции
 * - `VS` — Верховный Суд Российской Федерации
 * - `GV` — Гарнизонный военный суд
 * - `KV` — Кассационный военный суд
 * - `KJ` — Кассационный суд общей юрисдикции
 * - `OS` — Областной и равный ему суд
 * - `OV` — Окружной (флотский) военный суд
 * - `RS` — Районный, городской, межрайонный суд
 * - `AA` — Арбитражный апелляционный суд
 * - `AO` — Арбитражный суд округа
 * - `AI` — Суд по интеллектуальным правам
 * - `AS` — Арбитражный суд области
 * - `MS` — Мировой суд
 */
export type CourtTypeCode =
  | 'AV'
  | 'AJ'
  | 'VS'
  | 'GV'
  | 'KV'
  | 'KJ'
  | 'OS'
  | 'OV'
  | 'RS'
  | 'AA'
  | 'AO'
  | 'AI'
  | 'AS'
  | 'MS';
