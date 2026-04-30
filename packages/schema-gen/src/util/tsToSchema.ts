import { createGenerator, DEFAULT_CONFIG } from 'ts-json-schema-generator';
import type { CompletedConfig, Config, Schema } from 'ts-json-schema-generator';

import { inlineTopLevelNonObjectDefs } from './inlineTopLevelNonObjectDefs.js';
import { removeUnusedGenerics } from './removeUnusedGenerics.js';
import { traverseSchemaObjects } from './schemaHelpers.js';
import { log, logWarn } from './log.js';
import { replaceFullDescription } from './replaceFullDescription.js';
import { allowAdditionalProperties } from './allowAdditionalProperties.js';
import { inlineSingleRefGenerics } from './inlineSingleRefGenerics.js';
import { normalizeIntegerFormats } from './normalizeIntegerFormats.js';

export const tsToSchema = (generatorConfig: Config & { tsconfig?: string }): Schema => {
  const config: CompletedConfig = {
    ...DEFAULT_CONFIG,
    encodeRefs: false,
    fullDescription: true,
    // additionalProperties: true, // can't use this until https://github.com/vega/ts-json-schema-generator/issues/2273 resolved
    ...generatorConfig,
    tsconfig: generatorConfig.tsconfig ?? undefined,
    type: generatorConfig.type ?? '*',
  };

  const schema = createGenerator(config).createSchema(config.type);

  return postProcessGeneratedSchema(schema);
};

function postProcessGeneratedSchema(schema: Schema) {
  schema = replaceFullDescription(schema);
  schema = inlineSingleRefGenerics(schema);
  schema = removeUnusedGenerics(schema);
  schema = inlineTopLevelNonObjectDefs(schema);

  // Since schemas aren't unofficial, we should allow "additionalProperties" on all types so schemas
  // remain usable when Dadata adds new fields and we haven't updated the schemas yet
  schema = allowAdditionalProperties(schema);
  schema = normalizeIntegerFormats(schema);

  checkForWarnings(schema);
  return schema;
}

function checkForWarnings(schema: Schema) {
  if (schema.definitions) {
    const remainingGenerics = Object.keys(schema.definitions).filter((name) => name.includes('<'));

    if (remainingGenerics.length) {
      logWarn(
        "The generated schema contains the following generic definitions that can't be inlined or removed automatically.\n" +
          'This is how ts-json-schema-generator works.' +
          ' If you find this undesirable, consider:\n' +
          '  - Defining separate, exported types/interfaces that use these generic structures\n' +
          '  - Try using interfaces instead of types',
      );
      remainingGenerics.forEach((name) => log('\n * ' + name));
    }
  }

  traverseSchemaObjects(schema, (node, level, path) => {
    if (node.type && node.type === 'object') {
      // 1. Warn if there's object without properties/additional properties
      const propsCount = Object.keys(node.properties || {}).length;
      const addPropsCount = Object.keys(node.additionalProperties || {}).length;

      if (!propsCount && !addPropsCount) {
        logWarn(
          `Found "type": "object", but no properties were found. Decide whether this is intentional: `,
        );
        log(path.join('.'));
        log(node);
      }

      // 2. Warn if there's object that is not in top-level (definitions)
      if (level > 2) {
        logWarn(
          `Found an inlined object. Consider defining it as an exported type/interface so it gets its own reusable definition:`,
        );
        log(path.join('.'));
        log(node);
      }
    }
  });
}
