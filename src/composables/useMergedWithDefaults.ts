import { computed } from 'vue';
import type { ComputedRef } from 'vue';

/**
 * Merges the provided `overrides` with the `defaults`, returning a computed result.
 *
 * - The `defaults` object defines the full shape and required properties.
 * - The `overrides` object can include any subset of keys from `defaults`.
 * - Only keys that exist in `defaults` are merged; extra keys are ignored.
 *
 * @param defaults - The default values (required and complete).
 * @param overrides - Optional overrides for a subset of the default keys.
 * @returns A computed ref with the merged result, where all keys from the `defaults` always present.
 */
export function useMergedWithDefaults<T extends object>(
  defaults: Required<T>,
  overrides?: Partial<T>,
): ComputedRef<Required<T>> {
  return computed(() => {
    const merged = { ...defaults };

    for (const key in overrides) {
      if (key in defaults) {
        (merged as any)[key] = overrides[key as keyof T];
      }
    }

    return merged as Required<T>;
  });
}
