import { createGenerator, DEFAULT_CONFIG } from 'ts-json-schema-generator';
import type { CompletedConfig, Config, Schema } from 'ts-json-schema-generator';

import { inlineTopLevelNonObjectDefs } from './inlineTopLevelNonObjectDefs';
import { removeUnusedGenerics } from './removeUnusedGenerics';
import { traverseSchemaObjects } from './schemaHelpers';
import { log } from 'console';
import { logPanic } from './log';
import { replaceFullDescription } from './replaceFullDescription';

export const tsToSchema = (generatorConfig: Config): Schema => {
  const config: CompletedConfig = {
    ...DEFAULT_CONFIG,
    tsconfig: 'tsconfig.schema-gen.json',
    type: '*',
    encodeRefs: false,
    fullDescription: true,
    ...generatorConfig,
  };

  const schema = createGenerator(config).createSchema(config.type);

  return postProcessGeneratedSchema(schema);
};

function postProcessGeneratedSchema(schema: Schema) {
  schema = replaceFullDescription(schema);
  schema = removeUnusedGenerics(schema);
  schema = inlineTopLevelNonObjectDefs(schema);

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
        logPanic('Found "type": "object", but no properties were found:');
        log(node);
      }

      // 2. Warn if there's object that is not in top-level (definitions)
      if (level > 2) {
        logPanic('Found an inlined object. Define it as a separate exported interface:');
        log(node);
      }
    }
  });
}
