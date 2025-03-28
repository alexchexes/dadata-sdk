import type { AddressAdministrative, AddressFias, AddressMunicipal } from './address.types';
import type { FioData } from './fio.types';

/**
 * Type of a single address suggestion returned from API and exposed to the user
 */
export interface AddressSuggestion<T = AddressAdministrative | AddressMunicipal | AddressFias> {
  /** Адрес одной строкой (как показывается в списке подсказок) */
  value: string;
  /** Адрес одной строкой (полный, с индексом) */
  unrestricted_value: string;
  /** Подробные поля адреса */
  data: T;
}

export interface FioSuggestion {
  /** ФИО одной строкой */
  value: string;
  /** = value (ФИО одной строкой) */
  unrestricted_value: string;
  /** Подробности о ФИО */
  data: FioData;
}
