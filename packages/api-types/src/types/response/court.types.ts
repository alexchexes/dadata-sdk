import type { CourtTypeCode, SuggestionsResponse } from '../common.types';

/** @see https://dadata.ru/api/suggest/court/ */
export interface CourtSuggestion {
  /**
   * Название суда одной строкой (как показывается в списке подсказок)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности о судебном участке
   */
  data: CourtSuggestionData;
}

export interface CourtSuggestionData {
  /** Код суда (уникальный), например `52RS0001` */
  code: string;

  /** Полное название суда */
  name: string;

  /**
   * ИНН суда
   *
   * Юрлицами являются и ИНН имеют все суды, **кроме**:
   * - Мировой суд (MS)
   * - Районный, городской, межрайонный суд (RS)
   * - Гарнизонный военный суд (GV)
   */
  inn: string | null;

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
  court_type: CourtTypeCode;

  /** Наименование типа суда */
  court_type_name: string;

  /** Адрес суда */
  address: string;

  /** Юридический адрес суда. Только у судов, которые являются юрлицами */
  legal_address: string | null;

  /** Сайт суда, например: `http://dzerzhinsky.svd.sudrf.ru` */
  website: string | null;
}

export type SuggestCourtResponse = SuggestionsResponse<CourtSuggestion>;
