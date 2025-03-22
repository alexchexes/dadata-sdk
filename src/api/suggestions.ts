import axios from 'axios';
import type { SuggestAddressOptions } from '@/types';
import type { AddressSuggestion, SuggestAddressPayload } from '@/types/api';
import { DEFAULT_COUNT, SUGGEST_ADDRESS_URL } from '@/const/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** A simple in-memory cache that maps a key (request url, payload and headers) to a response */
const httpCache = new Map<string, AddressSuggestion[]>();

export const getSuggestions = async (
  params: SuggestAddressOptions,
): Promise<AddressSuggestion[]> => {
  const url = params.url ?? SUGGEST_ADDRESS_URL;
  const count = params.count ?? DEFAULT_COUNT;

  const payload: SuggestAddressPayload = {
    query: params.query,
    count,
  };

  if (params.division) {
    payload.division = params.division;
  }

  if (params.toBound) {
    payload.to_bound = { value: params.toBound };
  }

  if (params.fromBound) {
    payload.from_bound = { value: params.fromBound };
  }

  if (params.locationsFilter) {
    const locationsArray = Array.isArray(params.locationsFilter)
      ? params.locationsFilter
      : [params.locationsFilter];
    payload.locations = locationsArray;
  }

  if (params.radiusFilter) {
    payload.locations_geo = [params.radiusFilter];
  }

  if (params.restrictValue) {
    payload.restrict_value = params.restrictValue;
  }

  if (params.language) {
    payload.language = params.language;
  }

  if (params.locationsBoost) {
    const locationsBoostArray = Array.isArray(params.locationsBoost)
      ? params.locationsBoost.map((item) => ({ kladr_id: String(item) }))
      : [{ kladr_id: String(params.locationsBoost) }];

    if (locationsBoostArray.length) {
      payload.locations_boost = locationsBoostArray;
    }
  }

  const config = {
    headers: {
      ...DEFAULT_HEADERS,
      Authorization: `Token ${params.token}`,
    },
  };

  // Create a cache key that includes URL, payload and headers
  const cacheKey = JSON.stringify({
    url,
    payload,
    headers: config.headers,
  });

  // Caching is always enabled unless "cache" is explicitly set to false
  const useCache = params.httpCache !== false;

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
