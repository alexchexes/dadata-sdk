/**
 * Extracts the union type of all property values of an object type T.
 * For example, if T = { a: string; b: number }, then ValueOf<T> is string | number.
 */
export type ValueOf<T> = T[keyof T];
