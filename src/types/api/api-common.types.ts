import type {
  PARTY_BY_STATUSES,
  PARTY_BY_TYPES,
  PARTY_KZ_STATUSES,
  PARTY_KZ_TYPES,
  PARTY_STATUSES,
  PARTY_TYPES,
} from '@/const/api';
import type { FIO_GENDERS } from '@/const/api';

export type FioGenders = (typeof FIO_GENDERS)[number];

export type PartyType = (typeof PARTY_TYPES)[number];
export type PartyStatus = (typeof PARTY_STATUSES)[number];

export type PartyByType = (typeof PARTY_BY_TYPES)[number];
export type PartyByStatus = (typeof PARTY_BY_STATUSES)[number];

export type PartyKzType = (typeof PARTY_KZ_TYPES)[number];
export type PartyKzStatus = (typeof PARTY_KZ_STATUSES)[number];

export type FmsUnitType = '0' | '1' | '2' | '3';
