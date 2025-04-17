import type { Schema } from 'ts-json-schema-generator';

export const REF_PREFIX = '#/definitions/';

export function cloneSchema<T>(s: T): T {
  return JSON.parse(JSON.stringify(s));
}

export function getDefNameFromRef(ref?: string): string | undefined {
  return ref?.startsWith(REF_PREFIX) ? ref.slice(REF_PREFIX.length) : undefined;
}

export function traverseSchemaObjects(
  node: Schema,
  fn: (n: Schema, level: number) => void,
  initialLevel: number = 0,
): void {
  if (Array.isArray(node)) {
    // Call fn on every element of array
    node.forEach((n: Schema) => traverseSchemaObjects(n, fn, initialLevel));
  } else if (node && typeof node === 'object') {
    // Call fn on the node itself
    fn(node, initialLevel);
    // Call fn on every node key
    Object.values(node).forEach((v: Schema) => traverseSchemaObjects(v, fn, initialLevel + 1));
  }
}
