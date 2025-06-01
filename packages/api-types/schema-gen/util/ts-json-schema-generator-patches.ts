import * as ts from 'typescript';
import type { BaseType, Context } from 'ts-json-schema-generator';
import { UnionType } from 'ts-json-schema-generator';
import { MappedTypeNodeParser } from 'ts-json-schema-generator/dist/src/NodeParser/MappedTypeNodeParser';
import { derefType } from 'ts-json-schema-generator/dist/src/Utils/derefType';
import { LiteralType } from 'ts-json-schema-generator/dist/src/Type/LiteralType';
import { ObjectType } from 'ts-json-schema-generator/dist/src/Type/ObjectType';
import { ExtendedAnnotationsReader } from 'ts-json-schema-generator/dist/src/AnnotationsReader/ExtendedAnnotationsReader';

// --------------------------
// monkey-patch 'MappedTypeNodeParser.prototype.createType'
// until https://github.com/vega/ts-json-schema-generator/pull/2230 is merged
// --------------------------

const originalCreateType = MappedTypeNodeParser.prototype.createType;
export function MappedTypeNodeParser_createType(
  node: ts.MappedTypeNode,
  context: Context,
): BaseType {
  const constraintType = this.childNodeParser.createType(node.typeParameter.constraint, context);
  const keyListType = derefType(constraintType);
  const id = `indexed-type-${node.typeParameter.name.getText()}`;

  if (keyListType instanceof UnionType) {
    if (isDeepLiteralUnion(keyListType)) {
      return new ObjectType(
        id,
        [],
        this.getProperties(node, keyListType, context),
        this.additionalProperties,
      );
    }

    // PATCH: unwrap aliases to ensure only real non-literal types trigger additionalProperties
    const key = keyListType.getTypes().find((type) => !(derefType(type) instanceof LiteralType));

    const additionalProps = key
      ? (this.childNodeParser.createType(node.type, this.createSubContext(node, key, context)) ??
        this.additionalProperties)
      : this.additionalProperties;

    return new ObjectType(id, [], this.getProperties(node, keyListType, context), additionalProps);
  }

  // fallback to original logic for everything else
  return originalCreateType.call(this, node, context);
}
function isDeepLiteralUnion(type: BaseType): boolean {
  const resolved = derefType(type);

  if (resolved instanceof LiteralType) {
    return true;
  }

  if (resolved instanceof UnionType) {
    return resolved.getTypes().every((t) => isDeepLiteralUnion(t));
  }

  return false;
}

// --------------------------
// Monkey-patch 'ExtendedAnnotationsReader.prototype.getAnnotations'
// until https://github.com/vega/ts-json-schema-generator/pull/2224 is merged
// --------------------------

const originalGetAnnotations = ExtendedAnnotationsReader.prototype.getAnnotations;
export function ExtendedAnnotationsReader_getAnnotations(node: ts.Node) {
  const origAnnotations = originalGetAnnotations.call(this, node) || {};
  const rawJsDoc = getRawJsDoc(node);
  if (rawJsDoc) {
    // origAnnotations.rawJsDoc = rawJsDoc;
    origAnnotations.description = rawJsDoc;
  }
  return origAnnotations;
}
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
