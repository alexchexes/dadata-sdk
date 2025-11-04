export const BASE_SUGGEST_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/';

// Don't remove links, they serve for development
export const SUGGEST_TYPES = [
  'address', // https://dadata.ru/api/suggest/address/
  'country', // https://dadata.ru/api/suggest/country/
  'postal_unit', // https://dadata.ru/api/suggest/postal_unit/

  'fias', // https://dadata.ru/api/suggest/fias/

  'party', // https://dadata.ru/api/suggest/party/
  'party_by', // https://dadata.ru/api/suggest/party_by/
  'party_kz', // https://dadata.ru/api/suggest/party_kz/
  'bank', // https://dadata.ru/api/suggest/bank/
  'fio', // https://dadata.ru/api/suggest/name/

  'fms_unit', // https://dadata.ru/api/suggest/fms_unit/

  'email', // https://dadata.ru/api/suggest/email/

  'car_brand', // https://dadata.ru/api/suggest/car_brand/

  'fns_unit', // https://dadata.ru/api/suggest/fns_unit/
  'fts_unit', // https://dadata.ru/api/suggest/fts_unit/
  'court', // https://dadata.ru/api/suggest/court/
  'metro', // https://dadata.ru/api/suggest/metro/
  'mktu', // https://dadata.ru/api/suggest/mktu/
  'currency', // https://dadata.ru/api/suggest/currency/
  'okved2', // https://dadata.ru/api/suggest/okved2/
  'okpd2', // https://dadata.ru/api/suggest/okpd2/
  'oktmo', // https://dadata.ru/api/suggest/oktmo/
] as const;
