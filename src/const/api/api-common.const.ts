export const DEFAULT_COUNT = 10;
export const MAX_SUG_COUNT = 20;

export const PARTY_TYPES = ['LEGAL', 'INDIVIDUAL'] as const;
export const PARTY_STATUSES = ['ACTIVE', 'LIQUIDATING', 'LIQUIDATED'] as const;

export const BANK_TYPES = ['BANK', 'BANK_BRANCH', 'NKO', 'NKO_BRANCH', 'OTHER'] as const;
export const BANK_STATUSES = ['ACTIVE', 'LIQUIDATING'] as const;

export const FIO_PARTS = ['NAME', 'SURNAME', 'PATRONYMIC'] as const;
export const FIO_GENDERS = ['MALE', 'FEMALE', 'UNKNOWN'] as const;
