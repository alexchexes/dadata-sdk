/**
 * Extracts the union type of all property values of an object type T.
 * For example, if T = { a: string; b: number }, then ValueOf<T> is string | number.
 */
export type ValueOf<T> = T[keyof T];

export type OneOrMany<T> = T | T[];

/** Exact type equality check (structural) */
export type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/** Excel-style conditional: if `Cond` then `Then`, else `Else` */
export type If<Cond extends boolean, Then, Else = never> = Cond extends true ? Then : Else;

/** Logical NOT */
export type Not<T extends boolean> = T extends true ? false : true;

/** Logical AND */
export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

/** Logical OR */
export type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
    ? true
    : false;

/** Merges exactly two types A and B so that conflicting property types become a union. */
type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A & keyof B
    ? A[K] | B[K]
    : K extends keyof A
      ? A[K]
      : K extends keyof B
        ? B[K]
        : never;
};

/** Recursive: merges an array/tuple of types. */
export type MergeAll<T extends readonly unknown[]> = T extends [infer Only] // If there's exactly 1 type, return it as-is
  ? Only
  : T extends [infer First, infer Second, ...infer Rest] // If there's 2+, merge first two, then recurse
    ? MergeAll<[Merge<First, Second>, ...Rest]>
    : {}; // If empty, fallback to {}
