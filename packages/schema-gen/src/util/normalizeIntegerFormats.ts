import type { Schema } from 'ts-json-schema-generator';
import { traverseSchemaObjects } from './schemaHelpers.js';

const INTEGER_FORMATS = new Set(['int32', 'int64']);

/**
 * Converts OpenAPI integer formats from number schemas to integer schemas.
 */
export function normalizeIntegerFormats(schema: Schema): Schema {
  traverseSchemaObjects(schema, (node) => {
    if (!INTEGER_FORMATS.has(String(node.format))) {
      return;
    }

    if (node.type === 'number') {
      node.type = 'integer';
      return;
    }

    if (Array.isArray(node.type) && node.type.includes('number')) {
      node.type = [...new Set(node.type.map((type) => (type === 'number' ? 'integer' : type)))];
    }
  });

  return schema;
}
