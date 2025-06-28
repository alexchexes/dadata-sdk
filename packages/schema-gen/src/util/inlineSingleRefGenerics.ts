import type { Schema } from 'ts-json-schema-generator';
import { cloneSchema, getDefNameFromRef, traverseSchemaObjects } from './schemaHelpers.js';

/**
 * Inline generic definitions that are referenced exactly once.
 * The referencing node's properties (like `description`) override the original
 * generic definition values.
 */
export function inlineSingleRefGenerics(schema: Schema): Schema {
  if (!schema?.definitions) {
    return schema;
  }

  const cloned = { ...cloneSchema(schema), definitions: schema.definitions };
  const { definitions } = schema;

  // Count references for each definition
  const refCounts: Record<string, number> = {};
  traverseSchemaObjects(definitions, (node) => {
    const refDefName = getDefNameFromRef((node as any).$ref);
    if (refDefName) {
      refCounts[refDefName] = (refCounts[refDefName] || 0) + 1;
    }
  });

  const genericsToInline = Object.keys(definitions).filter(
    (name) => name.includes('<') && refCounts[name] === 1,
  );

  if (!genericsToInline.length) {
    return cloned;
  }

  function replaceRefs(node: Schema): any {
    if (Array.isArray(node)) {
      return node.map(replaceRefs);
    } else if (node && typeof node === 'object') {
      const refDefName = getDefNameFromRef(node.$ref);
      if (refDefName && genericsToInline.includes(refDefName)) {
        const defValue = cloned.definitions[refDefName];
        if (defValue && typeof defValue === 'object') {
          const inlined: Record<string, any> = cloneSchema(defValue) as any;
          for (const key in node) {
            if (key === '$ref') continue;
            (inlined as any)[key] = (node as any)[key];
          }
          return replaceRefs(inlined);
        }
      }

      const newObj: Record<string, any> = {};
      for (const key in node) {
        newObj[key] = replaceRefs((node as any)[key]);
      }
      return newObj;
    }
    return node;
  }

  const newSchema = replaceRefs(cloned);

  genericsToInline.forEach((name) => {
    delete (newSchema as any).definitions[name];
  });

  return newSchema;
}
