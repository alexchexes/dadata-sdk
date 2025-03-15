import axios from 'axios';
import type {
  AddressSuggestionsParams,
  AddressSuggestionsPayload,
  AddressSuggestion,
} from '../types';

const DEFAULT_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
const DEFAULT_COUNT = 10;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const getSuggestions = async (
  params: AddressSuggestionsParams,
): Promise<AddressSuggestion[]> => {
  const url = params.url ?? DEFAULT_URL;
  const count = params.count ?? DEFAULT_COUNT;

  let payload: AddressSuggestionsPayload = {
    query: params.query,
    count,
  };

  if (params.toBound) {
    payload = {
      ...payload,
      to_bound: { value: params.toBound },
    };
  }

  if (params.fromBound) {
    payload = {
      ...payload,
      from_bound: { value: params.fromBound },
    };
  }

  if (params.locationOptions) {
    payload = {
      ...payload,
      locations: params.locationOptions.locations,
    };
  }

  if (params.language) {
    payload.language = params.language;
  }

  if (params.locationsBoost) {
    const locationsBoostArray = Array.isArray(params.locationsBoost)
      ? params.locationsBoost.map((item) => ({ kladr_id: String(item) }))
      : [{ kladr_id: String(params.locationsBoost) }];

    if (locationsBoostArray.length) {
      payload = {
        ...payload,
        locations_boost: locationsBoostArray,
      };
    }
  }

  const config = {
    headers: {
      ...DEFAULT_HEADERS,
      Authorization: `Token ${params.token}`,
    },
  };

  const {
    data: { suggestions },
  } = await axios.post(url, payload, config);

  return suggestions;
};
