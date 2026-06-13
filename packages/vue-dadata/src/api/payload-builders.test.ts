import { describe, expect, it } from 'vitest';

import type { SuggestAddressOptions, SuggestFiasOptions } from '../types';
import { buildPayload } from './payload-builders';

const baseOptions = {
  count: 10,
  query: 'москва снежная',
  token: 'test-token',
} as const;

// --------------------------
// TODO: Write full test suite
// --------------------------

describe.each([
  ['address', { ...baseOptions, suggestType: 'address' } satisfies SuggestAddressOptions],
  ['fias', { ...baseOptions, suggestType: 'fias' } satisfies SuggestFiasOptions],
])('buildPayload %s bounds', (_suggestType, options) => {
  it('omits include when the options are not specified', () => {
    expect(
      buildPayload({
        ...options,
        fromBound: 'street',
        toBound: 'house',
      }),
    ).toEqual({
      query: baseOptions.query,
      from_bound: { value: 'street' },
      to_bound: { value: 'house' },
    });
  });

  it('omits include for the default inclusive bounds', () => {
    expect(
      buildPayload({
        ...options,
        fromBound: 'street',
        fromBoundInclude: true,
        toBound: 'house',
        toBoundInclude: true,
      }),
    ).toEqual({
      query: baseOptions.query,
      from_bound: { value: 'street' },
      to_bound: { value: 'house' },
    });
  });

  it('sends false for exclusive bounds', () => {
    expect(
      buildPayload({
        ...options,
        fromBound: 'street',
        fromBoundInclude: false,
        toBound: 'house',
        toBoundInclude: false,
      }),
    ).toEqual({
      query: baseOptions.query,
      from_bound: { value: 'street', include: false },
      to_bound: { value: 'house', include: false },
    });
  });
});
