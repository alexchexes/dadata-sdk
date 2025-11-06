import type { CourtTypeCode } from '../common.types';
import type { BaseSuggestPayload } from './suggest-payload.types';

/**
 * Параметры запроса к API "Подсказки по судам"
 *
 * @see https://dadata.ru/api/suggest/court/
 */
export interface SuggestCourtPayload extends BaseSuggestPayload {
  /**
   * Фильтрация работает по полю `court_type` (двухбуквенный тип суда):
   */
  filters?: SuggestCourtFilter[];
}

/** Объект для передачи фильтров API "Подсказки по судам" */
export interface SuggestCourtFilter {
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
  court_type?: CourtTypeCode;
}
