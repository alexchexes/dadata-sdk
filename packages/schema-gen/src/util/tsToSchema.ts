import { createGenerator, DEFAULT_CONFIG } from 'ts-json-schema-generator';
import type { CompletedConfig, Config, Schema } from 'ts-json-schema-generator';

import { inlineTopLevelNonObjectDefs } from './inlineTopLevelNonObjectDefs.js';
import { removeUnusedGenerics } from './removeUnusedGenerics.js';
import { traverseSchemaObjects } from './schemaHelpers.js';
import { log, logPanic, logWarn } from './log.js';
import { replaceFullDescription } from './replaceFullDescription.js';
import { allowAdditionalProperties } from './allowAdditionalProperties.js';

export const tsToSchema = (generatorConfig: Config & { tsconfig?: string }): Schema => {
  const config: CompletedConfig = {
    ...DEFAULT_CONFIG,
    tsconfig: generatorConfig.tsconfig ?? 'tsconfig.schema-gen.json',
    type: '*',
    encodeRefs: false,
    fullDescription: true,
    // additionalProperties: true, // can't use this until https://github.com/vega/ts-json-schema-generator/issues/2273 resolved
    ...generatorConfig,
  };

  const schema = createGenerator(config).createSchema(config.type);

  return postProcessGeneratedSchema(schema);
};

function postProcessGeneratedSchema(schema: Schema) {
  schema = replaceFullDescription(schema);
  schema = removeUnusedGenerics(schema);
  schema = inlineTopLevelNonObjectDefs(schema);

  // Since schemas aren't unofficial, we should allow "additionalProperties" on all types so schemas
  // remain usable when Dadata adds new fields and we haven't updated the schemas yet
  schema = allowAdditionalProperties(schema);

  checkForWarnings(schema);
  return schema;
}

function checkForWarnings(schema: Schema) {
  traverseSchemaObjects(schema, (node, level) => {
    if (node.type && node.type === 'object') {
      // 1. Warn if there's object without properties/additional properties
      const propsCount = Object.keys(node.properties || {}).length;
      const addPropsCount = Object.keys(node.additionalProperties || {}).length;

      if (!propsCount && !addPropsCount) {
        logPanic(
          'Found "type": "object", but no properties were found. This is likely unintended:',
        );
        log(node);
      }

      // 2. Warn if there's object that is not in top-level (definitions)
      if (level > 2) {
        logWarn(
          "Found an inlined object. It's better to define it as a separate exported interface:",
        );
        log(node);
      }
    }
  });
}
