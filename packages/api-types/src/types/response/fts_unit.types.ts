import type { SuggestionsResponse } from '../common.types';

/** @see https://dadata.ru/api/suggest/fts_unit/ */
export interface FtsUnitSuggestion {
  /**
   * Краткое название таможни (как показывается в списке подсказок)
   */
  value: string;
  /**
   * Полное название таможни
   */
  unrestricted_value: string;
  /**
   * Подробности о таможенном органе
   */
  data: FtsUnitSuggestionData;
}

export interface FtsUnitSuggestionData {
  /** Код таможни */
  code: string;
  /** Краткое название таможни */
  name_short: string;
  /** Полное название таможни */
  name: string;
  /** ИНН таможенного органа */
  inn: string | null;
  /** ОГРН таможенного органа */
  ogrn: string | null;
  /** Код ОКПО */
  okpo: string | null;
  /** Код организационно-структурной формы */
  osf: string | null;
  /** Адрес таможенного органа */
  address: string | null;
  /** Телефон */
  phone: string | null;
  /** Факс */
  fax: string | null;
  /** Адрес электронной почты */
  email: string | null;
}

export type SuggestFtsUnitResponse = SuggestionsResponse<FtsUnitSuggestion>;
