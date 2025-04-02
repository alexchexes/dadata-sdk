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

/**
 * Recursive: merges an array/tuple of types.
 */
export type MergeAll<T extends readonly unknown[]> = T extends [infer Only] // If there's exactly 1 type, return it as-is
  ? Only
  : T extends [infer First, infer Second, ...infer Rest] // If there's 2+, merge first two, then recurse
    ? MergeAll<[Merge<First, Second>, ...Rest]>
    : {}; // If empty, fallback to {}

/** Helper for 'MergeAll'. Merges exactly two types A and B so that conflicting property types become a union. */
type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A & keyof B
    ? A[K] | B[K]
    : K extends keyof A
      ? A[K]
      : K extends keyof B
        ? B[K]
        : never;
};

/**
 * Overrides the types of properties in T with those in R, while ensuring that all keys in R exist in T.
 */
export type Override<
  TBase,
  TOverride extends { [K in keyof TOverride]: K extends keyof TBase ? unknown : never },
> = {
  [K in keyof TBase as K extends keyof TOverride ? never : K]: TBase[K]; // keep everything except overrides
} & {
  [K in keyof TOverride]: K extends keyof TBase
    ? K extends OptionalKeys<TBase> // preserve optionality
      ? TOverride[K] | undefined
      : TOverride[K]
    : never;
};
/** Helper for 'Override' */
type OptionalKeys<TBase> = {
  [K in keyof TBase]-?: {} extends Pick<TBase, K> ? K : never;
}[keyof TBase];

/**
 * Allows pick and override keys at once, ensuring that no non-existent fields are used
 */
export type PickAndOverride<
  TBase,
  KPick extends keyof TBase,
  TOverride extends { [K in keyof TOverride]: K extends keyof TBase ? unknown : never },
> = Omit<
  // Pick from TBase all keys in K plus all keys in R
  Pick<TBase, KPick | OverridableKeys<TBase, TOverride>>,
  // Then remove the keys we’re about to override
  keyof TOverride
> &
  TOverride;

/** Helper for `PickAndOverride` */
type OverridableKeys<TBase, TOverride> = {
  [K in keyof TOverride]: K extends keyof TBase ? K : never;
}[keyof TOverride];

/**
 * Makes all properties of a union optional
 */
export type DistributivePartial<T> = T extends any ? Partial<T> : never;
