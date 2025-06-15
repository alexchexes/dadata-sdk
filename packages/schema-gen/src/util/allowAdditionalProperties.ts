import type { Schema } from 'ts-json-schema-generator';
import { traverseSchemaObjects } from './schemaHelpers.js';

/**
 * Remove `"additionalProperties": false` from all schema levels
 */
export function allowAdditionalProperties(schema: Schema): Schema {
  traverseSchemaObjects(schema, (node) => {
    if (
      node &&
      typeof node === 'object' &&
      'additionalProperties' in node &&
      node.additionalProperties === false
    ) {
      delete node.additionalProperties;
    }
  });

  return schema;
}
