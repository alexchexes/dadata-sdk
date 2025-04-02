import type { AddressFiasData } from './address.types';

/**
 * Suggestion object returned from `suggest/fias` or `findById/fias` API
 */
export interface FiasSuggestion {
  /** Адрес одной строкой (как показывается в списке подсказок) */
  value: string;
  /** Адрес одной строкой (полный, с индексом) */
  unrestricted_value: string;
  /** Подробные поля адреса */
  data: AddressFiasData;
}
