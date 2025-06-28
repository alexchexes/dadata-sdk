import type { Schema } from 'ts-json-schema-generator';
import { log, logY } from './log.js';
import { cloneSchema, getDefNameFromRef, traverseSchemaObjects } from './schemaHelpers.js';
type SchemaDefinition = boolean | Schema;

export function removeUnusedGenerics(schema: Schema): Schema {
  if (!schema?.definitions) {
    return schema;
  }
  const cloned = { ...cloneSchema(schema), definitions: schema.definitions };
  const { definitions } = schema;

  function isGenericUsed(defName: string): boolean {
    let used = false;

    traverseSchemaObjects(definitions, (node: Schema) => {
      if (used) {
        return;
      }

      if (node && typeof node === 'object' && '$ref' in node) {
        if (getDefNameFromRef((node as any).$ref) === defName) {
          used = true;
        }
      }
    });

    return used;
  }

  const defNamesToRemove: string[] = [];

  function recursivelyAddToRemove(defName: string, defValue: SchemaDefinition) {
    log(' - ' + (defName.length > 77 ? defName.slice(0, 80) + '...>' : defName));

    defNamesToRemove.push(defName);

    const refDefName =
      typeof defValue === 'object' && defValue?.$ref
        ? getDefNameFromRef(defValue?.$ref)
        : undefined;

    const refDefValue = refDefName ? definitions[refDefName] : undefined;

    if (refDefName && refDefValue && !defNamesToRemove.includes(refDefName)) {
      recursivelyAddToRemove(refDefName, refDefValue);
    }
  }

  Object.entries(definitions).forEach(([defName, defValue]) => {
    if (defName.includes('<')) {
      if (!isGenericUsed(defName)) {
        logY('\nRemoving generic definitions...');
        recursivelyAddToRemove(defName, defValue);
      }
    }
  });

  defNamesToRemove.forEach((defName) => {
    delete cloned.definitions[defName];
  });

  return cloned;
}
