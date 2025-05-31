import type { DeepPartial } from '@dadata-sdk/api-types';
import { isObject } from './is-object';

/**
 * Recursively computes the deep difference between two objects.
 * Returns an object containing only the keys from `obj2` that differ from `obj1`,
 * including added, changed, or removed properties.
 *
 * - If a property exists in one object but not the other, it will be included.
 * - For nested objects, the comparison is performed recursively.
 * - Arrays are compared by value and order.
 * - `null` and `[]` are treated as different.
 *
 * @param obj1 - The original object to compare from.
 * @param obj2 - The updated object to compare against.
 * @returns A deeply partial object containing only the differences, or null if there are no difference
 */
export function deepDiff<T extends object>(obj1: T, obj2: T): DeepPartial<T> | null {
  if (obj1 === obj2) return null;

  const result: any = {};

  const allKeys = [...Object.keys(obj1), ...Object.keys(obj2)];

  allKeys.forEach((key) => {
    const val1 = obj1?.[key as keyof typeof obj1];
    const val2 = obj2?.[key as keyof typeof obj2];

    const areObjects = isObject(val1) && isObject(val2);

    if (areObjects) {
      const diff = deepDiff(val1 as any, val2 as any);

      if (diff) {
        result[key] = diff;
      }
    } else if (!isEqual(val1, val2)) {
      result[key] = val2;
    }
  });

  return Object.keys(result).length ? result : null;
}

function isEqual(a: any, b: any): boolean {
  // Simple comparison, treats null and [] as unequal
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => isEqual(v, b[i]));
  }
  return a === b;
}
