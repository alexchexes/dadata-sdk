export const DEFAULT_COUNT = 10;
export const MAX_SUG_COUNT = 20;

// Party (RU, KZ, BY)

export const PARTY_TYPES = ['LEGAL', 'INDIVIDUAL'] as const;

/** {@link https://dadata.ru/api/suggest/party_by/} */
export const PARTY_BY_TYPES = ['LEGAL', 'INDIVIDUAL'] as const;

/** {@link https://dadata.ru/api/suggest/party_kz/} */
export const PARTY_KZ_TYPES = [
  'LEGAL',
  'INDIVIDUAL',
  'INDIVIDUAL_JOINT_VENTURE',
  'BRANCH',
  'FOREIGN_BRANCH',
] as const;

export const PARTY_STATUSES = [
  'ACTIVE',
  'BANKRUPT', // @note нет в документации по фильтрам
  'LIQUIDATED',
  'LIQUIDATING',
  'REORGANIZING', // @note нет в документации по фильтрам
] as const;

/** {@link https://dadata.ru/api/suggest/party_by/} */
export const PARTY_BY_STATUSES = [
  'ACTIVE',
  'BANKRUPT',
  'LIQUIDATED',
  'LIQUIDATING',
  'REORGANIZING',
  'SUSPENDED',
] as const;

/** {@link https://dadata.ru/api/suggest/party_kz/} */
export const PARTY_KZ_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'LIQUIDATED',
  'LIQUIDATING',
  'SUSPENDED',
] as const;

// Bank

/** {@link https://dadata.ru/api/suggest/bank/} */
export const BANK_TYPES = [
  'CBR', // @note нет в документации по фильтрам
  'BANK',
  'BANK_BRANCH',
  'NKO',
  'NKO_BRANCH',
  'RKC', // @note нет в документации по фильтрам
  'TREASURY', // @note нет в документации по фильтрам
  'OTHER',
] as const;
export const BANK_STATUSES = [
  'ACTIVE',
  'LIQUIDATED', // в реальных данных не встречается
  'LIQUIDATING',
] as const;

export const FIO_PARTS = ['NAME', 'SURNAME', 'PATRONYMIC'] as const;
export const FIO_GENDERS = ['MALE', 'FEMALE', 'UNKNOWN'] as const;
