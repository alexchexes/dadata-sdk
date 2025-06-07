import ts from 'typescript';
import { ExtendedAnnotationsReader } from 'ts-json-schema-generator/dist/src/AnnotationsReader/ExtendedAnnotationsReader';

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

// --------------------------
// Custom parser with SpreadElement support
// until https://github.com/vega/ts-json-schema-generator/pull/2269 is merged
// --------------------------
import type { Context, NodeParser, BaseType, MutableParser } from 'ts-json-schema-generator';
import { RestType } from 'ts-json-schema-generator/dist/src/Type/RestType';
import type { ArrayType } from 'ts-json-schema-generator/dist/src/Type/ArrayType';
import type { TupleType } from 'ts-json-schema-generator/dist/src/Type/TupleType';
import type { InferType } from 'ts-json-schema-generator/dist/src/Type/InferType';
import { UnknownNodeError } from 'ts-json-schema-generator/dist/src/Error/Errors';

/* ------------------------------------------------------------------ */
/* 1. IdentifierNodeParser – resolves compile-time const identifiers  */
/* ------------------------------------------------------------------ */
export class IdentifierNodeParser {
  constructor(
    private readonly child: NodeParser,
    private readonly checker: ts.TypeChecker,
  ) {}

  supportsNode(node: ts.Identifier): boolean {
    return node.kind === ts.SyntaxKind.Identifier;
  }

  createType(node: ts.Identifier, ctx: Context): BaseType {
    const sym = this.checker.getSymbolAtLocation(node);
    const decl = sym?.valueDeclaration;

    if (
      decl &&
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      // const only
      (ts.getCombinedNodeFlags(decl) & ts.NodeFlags.Const) !== 0
    ) {
      return this.child.createType(decl.initializer, ctx);
    }

    throw new UnknownNodeError(node);
  }
}

/* ----------------------------------------------------------- */
/* 2. SpreadElementNodeParser – turns  ...expr   into RestType */
/* ----------------------------------------------------------- */
export class SpreadElementNodeParser {
  constructor(private readonly child: NodeParser) {}

  supportsNode(node: ts.SpreadElement): boolean {
    return node.kind === ts.SyntaxKind.SpreadElement;
  }

  createType(node: ts.SpreadElement, ctx: Context): BaseType {
    const inner = this.child.createType(node.expression, ctx) as ArrayType | TupleType | InferType;
    return new RestType(inner);
  }
}

/* --------------------------------------------------------------------- */
/* 3. augmentor – plugs both parsers into the ChainNodeParser at runtime */
/* --------------------------------------------------------------------- */
export function addSpreadSupport(augmentee: MutableParser, checker: ts.TypeChecker) {
  augmentee
    .addNodeParser(new IdentifierNodeParser(augmentee as unknown as NodeParser, checker))
    .addNodeParser(new SpreadElementNodeParser(augmentee as unknown as NodeParser));
}
