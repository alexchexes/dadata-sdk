import type { FIO_PARTS } from '@/const/api';
import type { FioGenders } from '../api-common.types';
import type { BaseSuggestPayload } from './suggest-payload.types';

export type FioParts = (typeof FIO_PARTS)[number];

/**
 * @see https://dadata.ru/api/suggest/name/
 * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669111
 */
export interface SuggestFioPayload extends BaseSuggestPayload {
  /** Пол (`UNKNOWN` / `MALE` / `FEMALE`) */
  gender?: FioGenders;

  /**
   * Подсказки по части ФИО:
   * - Только имена: `["NAME"]`
   * - Имена и отчества: `["NAME", "PATRONYMIC"]`
   * - Имена и фамилии: `["NAME", "SURNAME"]`
   */
  parts?: FioParts[];
}
