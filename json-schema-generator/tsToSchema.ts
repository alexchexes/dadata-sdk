import ts from 'typescript';
import {
  createProgram,
  createParser,
  createFormatter,
  SchemaGenerator,
  DEFAULT_CONFIG,
} from 'ts-json-schema-generator';
import type { CompletedConfig, Config, Schema } from 'ts-json-schema-generator';
import { ExtendedAnnotationsReader } from 'ts-json-schema-generator/dist/src/AnnotationsReader/ExtendedAnnotationsReader';

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
    tsconfig: 'tsconfig.schema-generator.json',
    type: '*',
    encodeRefs: false,
    rawJsDoc: true,
    ...generatorConfig,
  };

  if (config.rawJsDoc) {
    // Monkey-patch 'getAnnotations' method so that it returns full JSDoc
    const originalGetAnnotations = ExtendedAnnotationsReader.prototype.getAnnotations;
    ExtendedAnnotationsReader.prototype.getAnnotations = function (node: ts.Node) {
      const origAnnotations = originalGetAnnotations.call(this, node) || {};
      const rawJsDoc = getRawJsDoc(node);
      if (rawJsDoc) {
        origAnnotations.rawJsDoc = rawJsDoc;
      }
      return origAnnotations;
    };
  }

  const program = createProgram(config);
  const parser = createParser(program, config);
  const formatter = createFormatter(config);
  const generator = new SchemaGenerator(program, parser, formatter, config);
  const schema = generator.createSchema(config.type);
  return schema;
};

// --------------------------
// These two are part of this PR to 'ts-json-schema-generator':
// https://github.com/vega/ts-json-schema-generator/pull/2224
// Remove them when the PR is merged and update to 'ts-json-schema-generator@next'
// --------------------------

function getRawJsDoc(node: ts.Node): string | undefined {
  const sourceFile = node.getSourceFile();
  const jsDocNodes = ts.getJSDocCommentsAndTags(node);

  if (!jsDocNodes || jsDocNodes.length === 0) {
    return undefined;
  }

  let rawText = '';

  for (const jsDoc of jsDocNodes) {
    rawText += jsDoc.getFullText(sourceFile) + '\n';
  }

  rawText = rawText.trim();

  return getTextWithoutStars(rawText).trim();
}
function getTextWithoutStars(inputText: string) {
  const innerTextWithStars = inputText
    .replace(/^\/\*\*[^\S\n]*\n?/, '')
    .replace(/(\r?\n)?[^\S\n]*\*\/$/, '');

  return innerTextWithStars
    .split(/\n/)
    .map((line) => {
      const trimmedLine = line.trimStart();

      if (trimmedLine[0] !== '*') {
        return line;
      }

      const textStartPos = trimmedLine[1] === ' ' ? 2 : 1;

      return trimmedLine.substring(textStartPos);
    })
    .join('\n');
}
