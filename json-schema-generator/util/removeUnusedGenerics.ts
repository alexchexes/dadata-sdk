import type { Schema } from 'ts-json-schema-generator';
import { log, logY } from './log';
import { cloneSchema, getDefNameFromRef, traverseSchemaObjects } from './schemaHelpers';
import chalk from 'chalk';
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

  const allFoundGenericsNames: string[] = [];
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
      allFoundGenericsNames.push(defName);
      if (!isGenericUsed(defName)) {
        logY('\nRemoving generic definitions...');
        recursivelyAddToRemove(defName, defValue);
      }
    }
  });

  let remainingGenerics: string[] = [...allFoundGenericsNames];

  defNamesToRemove.forEach((defName) => {
    delete cloned.definitions[defName];
    remainingGenerics = remainingGenerics.filter((name) => name !== defName);
  });

  if (remainingGenerics.length) {
    log(
      chalk.bgRed.yellowBright(
        "\n The generated schema contains the following generic definitions that can't be removed automatically.\n" +
          ' Generics in the schema are generally the result of "ts-json-schema-generator" bug/limitation.\n' +
          ' To avoid this:\n' +
          '  - Export the types/interfaces that use the generic structures listed below\n' +
          '  - Use interfaces (instead of types) when defining the shape of objects\n',
      ),
    );
    remainingGenerics.forEach((defName) => log('\n * ' + defName));
  }

  return cloned;
}
