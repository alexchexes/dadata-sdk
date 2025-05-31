import {
  createProgram,
  createParser,
  createFormatter,
  SchemaGenerator,
  DEFAULT_CONFIG,
} from 'ts-json-schema-generator';
import type { CompletedConfig, Config, Schema } from 'ts-json-schema-generator';
import { ExtendedAnnotationsReader } from 'ts-json-schema-generator/dist/src/AnnotationsReader/ExtendedAnnotationsReader';
import { MappedTypeNodeParser } from 'ts-json-schema-generator/dist/src/NodeParser/MappedTypeNodeParser';

import { inlineTopLevelNonObjectDefs } from './inlineTopLevelNonObjectDefs';
import {
  ExtendedAnnotationsReader_getAnnotations,
  MappedTypeNodeParser_createType,
} from './ts-json-schema-generator-patches';
import { removeUnusedGenerics } from './removeUnusedGenerics';
import { traverseSchemaObjects } from './schemaHelpers';
import { log } from 'console';
import { logPanic } from './log';

interface ConfigPatch {
  /**
   * Until https://github.com/vega/ts-json-schema-generator/pull/2224 is merged
   * this option enables monkey-patch to add "rawJsDoc" field to the schema
   */
  rawJsDoc?: boolean;
}
interface ConfigPatched extends Config, ConfigPatch {}
interface CompletedConfigPatched extends CompletedConfig, ConfigPatch {}

interface GeneratorConfig extends ConfigPatched {
  path: string;
}

export const tsToSchema = (generatorConfig: GeneratorConfig): Schema => {
  const config: CompletedConfigPatched = {
    ...DEFAULT_CONFIG,
    tsconfig: 'tsconfig.schema-gen.json',
    type: '*',
    encodeRefs: false,
    rawJsDoc: true,
    ...generatorConfig,
  };

  // Monkey-patch 'ts-json-schema-generator' until according PRs are merged

  if (config.rawJsDoc) {
    ExtendedAnnotationsReader.prototype.getAnnotations = ExtendedAnnotationsReader_getAnnotations;
  }

  MappedTypeNodeParser.prototype.createType = MappedTypeNodeParser_createType;

  const program = createProgram(config);
  const parser = createParser(program, config);
  const formatter = createFormatter(config);
  const generator = new SchemaGenerator(program, parser, formatter, config);
  const schema = generator.createSchema(config.type);

  return postProcessGeneratedSchema(schema);
};

function postProcessGeneratedSchema(schema: Schema) {
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
