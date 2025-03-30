type MergeDefined<T1 extends object, T2 extends object> = {
  // loop over all keys from T1 and T2 and ask for each:
  [K in keyof T1 | keyof T2]: K extends keyof T2 // IF_1: does K exist in T2?
    ? T2[K] extends undefined // if that key from T2 is explicitly `undefined`
      ? K extends keyof T1 // and if it exists in T1
        ? T1[K] // use from T1
        : T2[K] // else - leave as is (from T2)
      : T2[K] // if not `undefined` - leave as is (from T2)
    : // IF_1 ELSE (i.e. "if K not exists in T2"):
      K extends keyof T1 // if K exists in T1... (we can't use just `: T1[K]`)
      ? T1[K] // ... use it from T1
      : never; // (we never here because we loop only T1 and T2 keys, but this is required by TS)
};

/**
 * Merges two objects like `{ ...obj1, ...obj2 }`,
 * except that `undefined` values in `obj2` don’t override values from `obj1`.
 *
 * Example:
 * ```ts
 * const obj1 = { a: undefined, b: 2, c: 3, x: 88, z: undefined };
 * const obj2 = { a: 1, b: undefined, c: '3', y: 99, z: undefined };
 *
 * const merged = mergeDefined(obj1, obj2);
 * // merged:
 * { a: 1, b: 2, c: "3", x: 88, y: 99, z: undefined }
 * // merged type:
 * {
 *     a: number;
 *     b: number;
 *     c: string;
 *     x: number;
 *     y: number;
 *     z: undefined;
 * }
 * ```
 *
 * @param obj1 - The base object with fallback values.
 * @param obj2 - The overriding object that takes priority unless its value is `undefined`.
 * @returns A new object with values from `obj2` where defined, falling back to `obj1` otherwise.
 */
export function mergeDefined<A extends Record<string, any>, B extends Record<string, any>>(
  obj1: A,
  obj2: B,
): MergeDefined<A, B> {
  const result: Record<string, any> = { ...obj1, ...obj2 };

  for (const key in result) {
    if (obj2[key] === undefined && obj1[key] !== undefined) {
      result[key] = obj1[key];
    }
  }

  return result as MergeDefined<A, B>;
}
