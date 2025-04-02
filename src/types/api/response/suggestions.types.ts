import type { AddressAdminSuggestion, AddressMunicipalSuggestion } from './address.types';
import type { BankByIdSuggestion, BankSuggestion } from './bank.types';
import type { CarBrandSuggestion } from './car_brand.types';
import type { CountrySuggestion } from './countries.types';
import type { CurrencySuggestion } from './currency.types';
import type { EmailSuggestion } from './email.types';
import type { FiasSuggestion } from './fias.types';
import type { FioSuggestion } from './fio.types';
import type { FmsUnitSuggestion } from './fms_unit.types';
import type { FnsUnitSuggestion } from './fns_unit.types';
import type { FtsUnitSuggestion } from './fts_unit.types';
import type { MetroSuggestion } from './metro.types';
import type { MktuSuggestion } from './mktu.types';
import type { Okpd2Suggestion } from './okpd2.types';
import type { OktmoSuggestion } from './oktmo.types';
import type { Okved2Suggestion } from './okved2.types';
import type { PartyByIdSuggestion, PartySuggestion } from './party.types';
import type { PartyBySuggestion } from './party_by.types';
import type { PartyKzSuggestion } from './party_kz.types';
import type { PostalUnitSuggestion } from './postal_unit.types';
import type { RegionCourtSuggestion } from './region_court.types';

export type DadataSuggestion =
  | AddressAdminSuggestion
  | AddressMunicipalSuggestion
  | BankByIdSuggestion
  | BankSuggestion
  | CarBrandSuggestion
  | CountrySuggestion
  | CurrencySuggestion
  | EmailSuggestion
  | FiasSuggestion
  | FioSuggestion
  | FmsUnitSuggestion
  | FnsUnitSuggestion
  | FtsUnitSuggestion
  | MetroSuggestion
  | MktuSuggestion
  | Okpd2Suggestion
  | OktmoSuggestion
  | Okved2Suggestion
  | PartyByIdSuggestion
  | PartyBySuggestion
  | PartyKzSuggestion
  | PartySuggestion
  | PostalUnitSuggestion
  | RegionCourtSuggestion;
