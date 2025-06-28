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
  fn: (n: Schema, level: number, path: string[]) => void,
  level = 0,
  path: string[] = [],
): void {
  if (Array.isArray(node)) {
    node.forEach((n, i) => traverseSchemaObjects(n, fn, level, path.concat(String(i))));
  } else if (node && typeof node === 'object') {
    fn(node, level, path); // full path

    Object.entries(node).forEach(([k, v]) =>
      traverseSchemaObjects(v as Schema, fn, level + 1, path.concat(k)),
    );
  }
}
