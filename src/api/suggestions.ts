import axios from 'axios';
import type { SuggestAddressOptions, SuggestFiasOptions } from '@/types';
import type { AddressSuggestion, SuggestAddressPayload, SuggestFiasPayload } from '@/types/api';
import { BASE_SUGGEST_URL, DEFAULT_COUNT, DEFAULT_SUGGEST_TYPE } from '@/const/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** A simple in-memory cache that maps a key (request url, payload and headers) to a response */
const httpCache = new Map<string, AddressSuggestion[]>();

const buildBasePayload = (options: SuggestAddressOptions | SuggestFiasOptions) => {
  const count = options.count ?? DEFAULT_COUNT;

  const payload: SuggestFiasPayload | SuggestAddressPayload = {
    query: options.query,
    count,
  };

  if (options.toBound) {
    payload.to_bound = { value: options.toBound };
  }

  if (options.fromBound) {
    payload.from_bound = { value: options.fromBound };
  }

  if (options.locationsFilter) {
    const locationsArray = Array.isArray(options.locationsFilter)
      ? options.locationsFilter
      : [options.locationsFilter];
    payload.locations = locationsArray;
  }

  if (options.restrictValue) {
    payload.restrict_value = options.restrictValue;
  }

  if (options.locationsBoost) {
    const locationsBoostArray = Array.isArray(options.locationsBoost)
      ? options.locationsBoost.map((item) => ({ kladr_id: String(item) }))
      : [{ kladr_id: String(options.locationsBoost) }];

    if (locationsBoostArray.length) {
      payload.locations_boost = locationsBoostArray;
    }
  }

  if (options.restrictValue) {
    payload.restrict_value = options.restrictValue;
  }
  if (options.locationsBoost) {
    const locationsBoostArray = Array.isArray(options.locationsBoost)
      ? options.locationsBoost.map((item) => ({ kladr_id: String(item) }))
      : [{ kladr_id: String(options.locationsBoost) }];

    if (locationsBoostArray.length) {
      payload.locations_boost = locationsBoostArray;
    }
  }

  return payload;
};

const buildAddressPayload = (options: SuggestAddressOptions) => {
  const payload = buildBasePayload(options) as SuggestAddressPayload;

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
 * Builds a payload and makes a (cached) request to appropriate API endpoint
 */
export const getSuggestions = async (
  options: SuggestAddressOptions | SuggestFiasOptions,
): Promise<AddressSuggestion[]> => {
  const suggestType = options.suggestType ?? DEFAULT_SUGGEST_TYPE;

  let payload;

  if (suggestType === 'address') {
    payload = buildAddressPayload(options);
  } else if (suggestType === 'fias') {
    payload = buildBasePayload(options);
  } else {
    throw new Error(`Incorrect suggestType: '${suggestType}'`);
  }

  const url = options.url ? options.url : BASE_SUGGEST_URL + suggestType;

  // return makeApiRequest(url, options, payload);
  const config = {
    headers: {
      ...DEFAULT_HEADERS,
      Authorization: `Token ${options.token}`,
    },
  };

  // Create a cache key that includes URL, payload and headers
  const cacheKey = JSON.stringify({
    url,
    payload,
    headers: config.headers,
  });

  // Caching is always enabled unless "cache" is explicitly set to false
  const useCache = options.httpCache !== false;

  if (useCache && httpCache.has(cacheKey)) {
    return httpCache.get(cacheKey)!;
  }

  const {
    data: { suggestions },
  } = await axios.post(url, payload, config);

  if (useCache) {
    httpCache.set(cacheKey, suggestions);
  }

  return suggestions;
};
