import { BASE_SUGGEST_URL } from '@/const/api';
import { buildPayload } from './payload-builders';
import axios, { CanceledError, type RawAxiosRequestHeaders } from 'axios';
import type { DadataSuggestion } from '@/types/api';
import type { SuggestOptions } from '@/types';

const DEFAULT_HEADERS: RawAxiosRequestHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/** A simple in-memory cache that maps a key (request url, payload and headers) to a response */
const httpCache = new Map<string, unknown>();

export class ObsoleteResponseError extends Error {
  name = 'ObsoleteResponseError';
}

/**
 * Builds a payload and makes a (cached) request to appropriate 'suggest' API endpoint
 */
export const makeSuggestRequest = async (options: SuggestOptions): Promise<DadataSuggestion[]> => {
  const payload = buildPayload(options);

  const url = options.url ? options.url : BASE_SUGGEST_URL + options.suggestType;

  const headers = {
    ...DEFAULT_HEADERS,
    Authorization: `Token ${options.token}`,
    ...(options.headers || {}),
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
let latestRequestToken = 0;

const makeCachedRequest = async <T>(
  url: string,
  payload: unknown,
  headers: RawAxiosRequestHeaders,
  useCache: boolean,
): Promise<T> => {
  // Increment the global request counter and save the current value to a local variable,
  // so we can check, when a response arrives, whether it is the latest request
  latestRequestToken++;
  const reqToken = latestRequestToken;

  // Cancel the previous request (if still in progress)
  if (activeController) {
    activeController.abort();
  }

  const cacheKey = JSON.stringify({ url, payload });

  if (useCache) {
    const cached = httpCache.get(cacheKey) as T | undefined;
    if (cached) {
      if (reqToken !== latestRequestToken) {
        throw new ObsoleteResponseError();
      }
      return cached;
    }
  }

  const controller = new AbortController();
  activeController = controller;

  try {
    const { data } = await axios.post<T>(url, payload, { headers, signal: controller.signal });

    if (reqToken !== latestRequestToken) {
      throw new ObsoleteResponseError();
    }

    if (useCache) {
      httpCache.set(cacheKey, data);
    }

    return data;
  } catch (error) {
    if (error instanceof CanceledError) {
      throw new ObsoleteResponseError();
    }
    throw error;
  } finally {
    activeController = null;
  }
};
