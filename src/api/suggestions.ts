import axios from 'axios';
import { BASE_SUGGEST_URL, DEFAULT_COUNT } from '@/const/api';
import type {
  LocationsFilterItem,
  OneOrMany,
  SuggestAddressOptions,
  SuggestBankOptions,
  SuggestFiasOptions,
  SuggestFioOptions,
  SuggestOptions,
  SuggestOptionsWithFilters,
  SuggestPartyOptions,
} from '@/types';
import type {
  KladrIdFilter,
  LocationRestriction,
  SuggestAddressPayload,
  SuggestBankPayload,
  SuggestFiasPayload,
  SuggestFioPayload,
  SuggestPartyByPayload,
  SuggestPartyKzPayload,
  SuggestPartyPayload,
  SuggestPayload,
  SuggestPayloadWithFilters,
} from '@/types/api';
import type { DadataSuggestion } from '@/types/api';
import type { SuggestPartyByOptions } from '@/types/suggest-options-party_by.types';
import type { SuggestPartyKzOptions } from '@/types/suggest-options-party_kz.types';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/** A simple in-memory cache that maps a key (request url, payload and headers) to a response */
const httpCache = new Map<string, unknown>();

/**
 * Normalizes value of a given type to array of values of the same type
 */
const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);

/**
 * Makes sure that `kladr_id`s like `1` always become `'01'`
 */
const normalizeKladrCode = (kladrCode: string | number): string =>
  String(kladrCode).padStart(2, '0');

/**
 * Transforms string, number, objects of dadata restriction format to object `{ <type of filter>: string }`,
 * also transfroms kladr_id from `1` to `'01'`
 */
const toLocationRestrictionObject = (restrItem: LocationsFilterItem): LocationRestriction => {
  if (typeof restrItem === 'object') {
    if (typeof restrItem.kladr_id === 'number') {
      return { ...restrItem, kladr_id: normalizeKladrCode(restrItem.kladr_id) };
    }
    return restrItem;
  }
  return { kladr_id: normalizeKladrCode(restrItem) };
};

/**
 * Transforms string, number, objects of dadata restriction format, or array of those,
 * to array of objects in format `[{ <type of filter>: string }]`
 */
const normalizeLocationsFilter = (input: OneOrMany<LocationsFilterItem>): LocationRestriction[] => {
  if (Array.isArray(input)) {
    // If input is an array, each element can be a string, number, or object
    return input.map(toLocationRestrictionObject);
  }

  // Otherwise it's a single item: a string, number, or an object
  return [toLocationRestrictionObject(input)];
};

/**
 * Transforms string, number, objects of dadata restriction format, or array of those,
 * to array of objects in format `[{ kladr_id: string }]`
 */
const normalizeKladrIdFilter = (input: OneOrMany<LocationsFilterItem>): KladrIdFilter[] => {
  return normalizeLocationsFilter(input)
    .filter((restrItem) => restrItem.kladr_id?.length)
    .map((restrItem): KladrIdFilter => ({ kladr_id: restrItem.kladr_id }));
};

/**
 * Payload params common for all 'suggest/...' APIs
 */
const buildBasePayload = (options: SuggestOptions) => ({
  query: options.query,
  count: options.count ?? DEFAULT_COUNT,
});

/** Payload params common for all APIs that support `filters` option */
const buildBasePayloadWithFilters = (options: SuggestOptionsWithFilters) => {
  const payload = buildBasePayload(options) as SuggestPayloadWithFilters;
  if (options.filters) {
    const filtersArr = toArray(options.filters);
    payload.filters = filtersArr;
  }

  return payload;
};

/**
 * Payload params common for 'address', 'fias', 'party' and 'bank' APIs
 */
const buildPayloadWithLocationsOptions = (
  options: SuggestAddressOptions | SuggestFiasOptions | SuggestPartyOptions | SuggestBankOptions,
) => {
  const payload = buildBasePayload(options) as
    | SuggestAddressPayload
    | SuggestFiasPayload
    | SuggestAddressPayload
    | SuggestFiasPayload;

  if (options.locationsBoost) {
    const locationsBoostArray = normalizeKladrIdFilter(options.locationsBoost);

    if (locationsBoostArray.length) {
      payload.locations_boost = locationsBoostArray;
    }
  }

  if (options.locationsFilter) {
    const locationsArray = normalizeLocationsFilter(options.locationsFilter);

    if (locationsArray.length) {
      payload.locations = locationsArray;
    }
  }

  return payload;
};

/**
 * Payload params common for 'address' and 'fias' APIs
 */
const buildBaseAddressPayload = (options: SuggestAddressOptions | SuggestFiasOptions) => {
  const payload = buildPayloadWithLocationsOptions(options) as
    | SuggestAddressPayload
    | SuggestFiasPayload;

  if (options.toBound) {
    payload.to_bound = { value: options.toBound };
  }

  if (options.fromBound) {
    payload.from_bound = { value: options.fromBound };
  }

  if (options.restrictValue) {
    payload.restrict_value = options.restrictValue;
  }

  return payload;
};

/**
 * Payload params for 'address' API
 */
const buildNormalAddressPayload = (options: SuggestAddressOptions) => {
  const payload = buildBaseAddressPayload(options) as SuggestAddressPayload;

  if (options.division) {
    payload.division = options.division;
  }

  if (options.radiusFilter) {
    payload.locations_geo = [options.radiusFilter];
  }

  if (options.language) {
    payload.language = options.language;
  }

  return payload;
};

/**
 * Payload params for 'fias' API
 */
const buildFiasPayload = (options: SuggestFiasOptions) =>
  buildBaseAddressPayload(options) as SuggestFiasPayload;

/**
 * Payload params common for 'bank' and 'party' APIs
 */
const buildBaseOrganizationPayload = (options: SuggestBankOptions | SuggestPartyOptions) => {
  const payload = buildPayloadWithLocationsOptions(options) as
    | SuggestBankPayload
    | SuggestPartyPayload;

  if (options.entityStatus) {
    const statusArray = toArray(options.entityStatus);
    if (statusArray.length) {
      payload.status = statusArray;
    }
  }

  return payload;
};

/**
 * Payload params for 'bank' API
 */
const buildBankPayload = (options: SuggestBankOptions) => {
  const payload = buildBaseOrganizationPayload(options) as SuggestBankPayload;

  if (options.entityType) {
    const typeArray = toArray(options.entityType);
    if (typeArray.length) {
      payload.type = typeArray;
    }
  }

  return payload;
};

/**
 * Payload params for 'party' API
 */
const buildPartyPayload = (options: SuggestPartyOptions) => {
  const payload = buildBaseOrganizationPayload(options) as SuggestPartyPayload;

  if (options.entityType) {
    // The 'party' API accepts only a single value, but we allow passing it as an array
    // for consistency with other APIs that accept the 'type' option.
    if (Array.isArray(options.entityType) && options.entityType[0]) {
      payload.type = options.entityType[0];
    } else {
      // @ts-expect-error — We allow passing an incorrect value (array) to the API because
      // we can't decide for the user which element to pick, nor can we omit the option entirely.
      payload.type = options.entityType;
    }
  }

  if (options.okved) {
    const okvedArray = toArray(options.okved);
    if (okvedArray.length) {
      payload.okved = okvedArray;
    }
  }

  return payload;
};

const buildPartyByPayload = (options: SuggestPartyByOptions) => {
  const payload = buildBasePayloadWithFilters(options) as SuggestPartyByPayload;

  const types = toArray(options.entityType).filter((v) => v);
  const statuses = toArray(options.entityStatus).filter((v) => v);

  if (types.length && statuses.length) {
    // Generate a cartesian product, since the API doesn't accept:
    // [{ type: 'LEGAL' }, { status: 'BANKRUPT' }, { status: 'SUSPENDED' }]
    // It requires:
    // [{ type: 'LEGAL', status: 'BANKRUPT' }, { type: 'LEGAL', status: 'SUSPENDED' }]
    payload.filters = types.flatMap((type) => statuses.map((status) => ({ type, status })));
  } else if (types.length) {
    payload.filters = types.map((type) => ({ type }));
  } else if (statuses.length) {
    payload.filters = statuses.map((status) => ({ status }));
  }

  return payload;
};

const buildPartyKzPayload = (options: SuggestPartyKzOptions) => {
  const payload = buildBasePayloadWithFilters(options) as SuggestPartyKzPayload;

  if (options.entityType) {
    const typesArray = toArray(options.entityType)
      .filter((v) => v)
      .map((type) => ({ type }));
    if (!payload.filters) {
      payload.filters = typesArray;
    } else {
      payload.filters = { ...payload.filters, ...typesArray };
    }
  }

  return payload;
};

/**
 * Payload params for 'fio' API
 */
const buildFioPayload = (options: SuggestFioOptions) => {
  const payload = buildBasePayload(options) as SuggestFioPayload;

  if (options.fioGender) {
    payload.gender = options.fioGender;
  }

  if (options.fioParts) {
    const partsArray = toArray(options.fioParts);
    if (partsArray.length) {
      payload.parts = partsArray;
    }
  }

  return payload;
};

/**
 * Converts options to payload params, based on the suggestType
 */
const buildPayload = (options: SuggestOptions): SuggestPayload => {
  switch (options.suggestType) {
    case 'address':
      return buildNormalAddressPayload(options);
    case 'fias':
      return buildFiasPayload(options);
    case 'fio':
      return buildFioPayload(options);
    case 'bank':
      return buildBankPayload(options);
    case 'party':
      return buildPartyPayload(options);
    case 'party_by':
      return buildPartyByPayload(options);
    case 'party_kz':
      return buildPartyKzPayload(options);
    default:
      if ((options as SuggestOptionsWithFilters).filters) {
        return buildBasePayloadWithFilters(options as SuggestOptionsWithFilters);
      }
      return buildBasePayload(options);
  }
};

/**
 * Builds a payload and makes a (cached) request to appropriate 'suggest' API endpoint
 */
export const makeSuggestRequest = async (options: SuggestOptions): Promise<DadataSuggestion[]> => {
  const payload = buildPayload(options);

  const url = options.url ? options.url : BASE_SUGGEST_URL + options.suggestType;

  const headers = {
    ...DEFAULT_HEADERS,
    Authorization: `Token ${options.token}`,
  };

  const useCache = options.httpCache !== false;
  const data = await makeCachedRequest(url, payload, headers, useCache);

  if (data && typeof data === 'object' && 'suggestions' in data) {
    return data.suggestions as DadataSuggestion[];
  } else {
    throw new Error(
      `Failed to get 'suggestions' from API response. Received: ${JSON.stringify(data)}`,
    );
  }
};

let activeController: AbortController | null = null;

const makeCachedRequest = async <T>(
  url: string,
  payload: unknown,
  headers: Record<string, string>,
  useCache: boolean,
): Promise<T> => {
  // Cancel the previous request (if still in progress)
  if (activeController) {
    activeController.abort();
  }

  const cacheKey = JSON.stringify({ url, payload });

  if (useCache) {
    const cached = httpCache.get(cacheKey) as T | undefined;
    if (cached) return cached;
  }

  const controller = new AbortController();
  activeController = controller;

  try {
    const { data } = await axios.post<T>(url, payload, { headers, signal: controller.signal });

    if (useCache) {
      httpCache.set(cacheKey, data);
    }

    return data;
  } finally {
    activeController = null;
  }
};
