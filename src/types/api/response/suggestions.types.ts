import type { AddressAdministrative, AddressFias, AddressMunicipal } from './address.types';

/**
 * Type of a single address suggestion returned from API and exposed to the user
 */
export interface AddressSuggestion<T = AddressAdministrative | AddressMunicipal | AddressFias> {
  value: string;
  unrestricted_value: string;
  data: T;
}
