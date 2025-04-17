import { Schema } from 'ts-json-schema-generator';
import { cloneSchema, getDefNameFromRef } from './schemaHelpers';

export function inlineTopLevelNonObjectDefs(schema: Schema) {
  if (!schema?.definitions) {
    return schema;
  }
  const cloned = { ...cloneSchema(schema), definitions: schema.definitions };
  const { definitions } = schema;

  // Collect definitions that are not of type "object" from schema.definitions.
  const defsToInline: Record<string, Schema> = {};
  for (const defName in definitions) {
    const defValue = definitions[defName];
    if (typeof defValue === 'object' && defValue?.type && defValue.type !== 'object') {
      defsToInline[defName] = defValue;
    }
  }

  // Recursive function to traverse the schema.
  function replaceRefs(node: Schema) {
    if (Array.isArray(node)) {
      return node.map(replaceRefs);
    } else if (node && typeof node === 'object') {
      const refDefName = getDefNameFromRef(node.$ref);

      if (refDefName && defsToInline[refDefName]) {
        // Deep copy the definition.
        const inlined = cloneSchema(defsToInline[refDefName]);

        // Merge additional properties from the referencing object (other than $ref).
        for (const key in node) {
          if (key === '$ref') continue;

          if (inlined.hasOwnProperty(key)) {
            // Merge if property already exists.
            inlined[key] = mergeValues(inlined[key], node[key]);
          } else {
            inlined[key] = node[key];
          }
        }
        return inlined;
      }

      const newObj = {};
      for (const key in node) {
        newObj[key] = replaceRefs(node[key]);
      }
      return newObj;
    }
    return node;
  }

  const newSchema = replaceRefs(cloned);

  // Remove the inlined definitions from the top-level "definitions".
  if (newSchema.definitions) {
    for (const key in defsToInline) {
      delete newSchema.definitions[key];
    }
  }

  return newSchema;
}

function mergeValues(defValue: Schema, refValue: Schema) {
  // Merge string values
  if (typeof defValue === 'string' && typeof refValue === 'string') {
    return defValue + '\n' + refValue;
  }

  // Concatenate arrays
  else if (Array.isArray(defValue) && Array.isArray(refValue)) {
    return defValue.concat(refValue);
  }

  // Shallow merge objects: for keys that exist in both, use mergeValues recursively.
  else if (defValue && typeof defValue === 'object' && refValue && typeof refValue === 'object') {
    const merged = Object.assign({}, defValue);

    for (const key in refValue) {
      if (merged.hasOwnProperty(key)) {
        merged[key] = mergeValues(merged[key], refValue[key]);
      } else {
        merged[key] = refValue[key];
      }
    }

    return merged;
  }

  // In other cases, give precedence to the referencing (refValue)
  else {
    return refValue;
  }
}
