import type { Schema } from 'ts-json-schema-generator';
import { traverseSchemaObjects } from './schemaHelpers.js';

/**
 * Copies `fullDescription` into `description` (over-writing any existing value)
 * and then removes `fullDescription` so that callers see the long variant only.
 */
export function replaceFullDescription(schema: Schema): Schema {
  // Handle the root object itself ...
  if ('fullDescription' in schema && schema.fullDescription) {
    schema.description = schema.fullDescription as string;
    delete schema.fullDescription;
  }

  // ...and everything nested
  traverseSchemaObjects(schema, (node) => {
    if (node && typeof node === 'object' && 'fullDescription' in node) {
      node.description = node.fullDescription as string;
      delete node.fullDescription;
    }
  });

  return schema;
}
