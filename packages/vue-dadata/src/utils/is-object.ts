export function isObject(val: unknown): val is object {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}
