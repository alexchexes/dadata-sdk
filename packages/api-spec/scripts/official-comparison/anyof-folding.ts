import type { OpenAPIV3_1 } from '@scalar/openapi-types';

import type { ComparisonNormalizationDecision } from './comparison-normalization.js';
import { cloneJson, isRecord } from './io.js';
import type { HttpMethod } from './openapi.js';

export interface AnyOfFoldingRule {
  operation: {
    method: HttpMethod;
    path: string;
  };
  request?: {
    mediaType: string;
  };
  response?: {
    mediaType: string;
    status: string;
  };
  schemaPath: string;
  target: 'official' | 'ours';
}

/** Applies explicitly approved object-anyOf folds to path-local operation schemas. */
export function applyAnyOfFoldingRules(
  document: OpenAPIV3_1.Document,
  rules: AnyOfFoldingRule[],
): ComparisonNormalizationDecision[] {
  const root = document as unknown as Record<string, unknown>;
  const decisions: ComparisonNormalizationDecision[] = [];

  for (const rule of rules) {
    const schema = findOperationSchema(document, root, rule);
    const targetSchema = materializeSchemaPath(root, schema, rule.schemaPath, formatRuleIdentity(rule));
    const decision = foldObjectAnyOf(targetSchema, root, formatRuleDecisionPath(rule));

    decisions.push(decision);
  }

  return decisions;
}

/** Finds and materializes the request/response schema root for one folding rule. */
function findOperationSchema(
  document: OpenAPIV3_1.Document,
  root: Record<string, unknown>,
  rule: AnyOfFoldingRule,
): Record<string, unknown> {
  const pathItem = document.paths?.[rule.operation.path];

  if (!isRecord(pathItem)) {
    throw new Error(`AnyOf folding rule points to missing path: ${rule.operation.path}.`);
  }

  const operation = pathItem[rule.operation.method];

  if (!isRecord(operation)) {
    throw new Error(
      `AnyOf folding rule points to missing operation: ${rule.operation.method.toUpperCase()} ${rule.operation.path}.`,
    );
  }

  if (rule.request) {
    return findRequestSchema(root, operation, rule);
  }

  if (rule.response) {
    return findResponseSchema(root, operation, rule);
  }

  throw new Error(`AnyOf folding rule must specify request or response: ${formatRuleIdentity(rule)}.`);
}

/** Finds and materializes the media schema for a request folding rule. */
function findRequestSchema(
  root: Record<string, unknown>,
  operation: Record<string, unknown>,
  rule: AnyOfFoldingRule,
): Record<string, unknown> {
  const mediaType = rule.request?.mediaType;
  const requestBody = requireRecord(operation.requestBody, `requestBody for ${formatRuleIdentity(rule)}`);
  const content = requireRecord(requestBody.content, `requestBody.content for ${formatRuleIdentity(rule)}`);
  const media = requireRecord(content[mediaType ?? ''], `request media ${mediaType} for ${formatRuleIdentity(rule)}`);

  return materializeSchemaProperty(root, media, 'schema', `request schema for ${formatRuleIdentity(rule)}`);
}

/** Finds and materializes the media schema for a response folding rule. */
function findResponseSchema(
  root: Record<string, unknown>,
  operation: Record<string, unknown>,
  rule: AnyOfFoldingRule,
): Record<string, unknown> {
  const response = rule.response;
  const responses = requireRecord(operation.responses, `responses for ${formatRuleIdentity(rule)}`);
  const responseObject = requireRecord(
    responses[response?.status ?? ''],
    `response ${response?.status} for ${formatRuleIdentity(rule)}`,
  );
  const content = requireRecord(responseObject.content, `response.content for ${formatRuleIdentity(rule)}`);
  const media = requireRecord(
    content[response?.mediaType ?? ''],
    `response media ${response?.mediaType} for ${formatRuleIdentity(rule)}`,
  );

  return materializeSchemaProperty(root, media, 'schema', `response schema for ${formatRuleIdentity(rule)}`);
}

/** Follows a compact schema path through properties/items, materializing refs on that path. */
function materializeSchemaPath(
  root: Record<string, unknown>,
  schema: Record<string, unknown>,
  schemaPath: string,
  ruleIdentity: string,
): Record<string, unknown> {
  const segments = schemaPath.split('/').filter(Boolean);
  let current = schema;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index] ?? '';

    if (segment === 'items') {
      current = materializeSchemaProperty(root, current, 'items', `${ruleIdentity} schemaPath ${schemaPath}`);
      continue;
    }

    const prefix = segments.slice(0, index).join('/') || '<schema>';
    const properties = requireRecord(current.properties, `${ruleIdentity} properties at ${prefix}`);

    current = materializeSchemaProperty(
      root,
      properties,
      segment,
      `${ruleIdentity} property ${segment} in schemaPath ${schemaPath}`,
    );
  }

  return current;
}

/** Replaces a schema property with a cloned local $ref target when needed. */
function materializeSchemaProperty(
  root: Record<string, unknown>,
  owner: Record<string, unknown>,
  key: string,
  context: string,
): Record<string, unknown> {
  const value = owner[key];

  if (!isRecord(value)) {
    throw new Error(`${context} must be a schema object.`);
  }

  const materialized = materializeSchema(root, value);

  if (materialized !== value) {
    owner[key] = materialized;
  }

  return materialized;
}

/** Clones a local $ref schema target and preserves non-$ref siblings. */
function materializeSchema(
  root: Record<string, unknown>,
  schema: Record<string, unknown>,
): Record<string, unknown> {
  if (typeof schema.$ref !== 'string') {
    return schema;
  }

  const resolved = resolveLocalRef(root, schema.$ref);

  if (!isRecord(resolved)) {
    throw new Error(`Failed to resolve local schema ref ${schema.$ref}.`);
  }

  const materialized = cloneJson(resolved);

  for (const [key, value] of Object.entries(schema)) {
    if (key !== '$ref') {
      materialized[key] = cloneJson(value);
    }
  }

  return materialized;
}

/** Folds a target anyOf made from at least two object branches into one merged object schema. */
function foldObjectAnyOf(
  schema: Record<string, unknown>,
  root: Record<string, unknown>,
  decisionPath: string,
): ComparisonNormalizationDecision {
  const anyOf = schema.anyOf;

  if (!Array.isArray(anyOf) || anyOf.length === 0) {
    throw new Error(`AnyOf folding target is missing a non-empty anyOf: ${decisionPath}.`);
  }

  const branchRefs: string[] = [];
  const objectBranches: Record<string, unknown>[] = [];
  let hasNullBranch = false;

  for (const branch of anyOf) {
    const resolvedBranch = resolveCompositionBranch(root, branch, branchRefs);

    if (isNullSchema(resolvedBranch)) {
      hasNullBranch = true;
      continue;
    }

    if (!isObjectSchema(resolvedBranch)) {
      throw new Error(`AnyOf folding only supports object branches and null branches: ${decisionPath}.`);
    }

    objectBranches.push(resolvedBranch);
  }

  if (objectBranches.length < 2) {
    throw new Error(`AnyOf folding requires at least two object branches after resolution: ${decisionPath}.`);
  }

  const foldedSchema = mergeObjectBranches(objectBranches, decisionPath);

  if (hasNullBranch) {
    addNullType(foldedSchema);
  }

  replaceSchemaWithFoldedAnyOf(schema, foldedSchema);

  return {
    branchRefs,
    compositionKey: 'anyOf',
    kind: 'folded-object-anyof',
    objectBranchCount: objectBranches.length,
    path: decisionPath,
  };
}

/** Resolves an anyOf branch for folding while recording branch refs for diagnostics. */
function resolveCompositionBranch(
  root: Record<string, unknown>,
  branch: unknown,
  branchRefs: string[],
): Record<string, unknown> {
  if (!isRecord(branch)) {
    throw new Error('AnyOf folding branch must be a schema object.');
  }

  const ref = getPlainRef(branch);

  if (!ref) {
    return branch;
  }

  const resolved = resolveLocalRef(root, ref);

  if (!isRecord(resolved)) {
    throw new Error(`Failed to resolve anyOf branch ref ${ref}.`);
  }

  branchRefs.push(ref);

  return resolved;
}

/** Merges object anyOf branches using property union and required intersection. */
function mergeObjectBranches(
  branches: Record<string, unknown>[],
  decisionPath: string,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  let requiredIntersection: Set<string> | null = null;
  let additionalProperties: unknown = undefined;

  for (const branch of branches) {
    mergeBranchProperties(properties, getRecord(branch.properties) ?? {}, decisionPath);
    requiredIntersection = intersectRequired(requiredIntersection, branch.required);

    if (branch.additionalProperties !== undefined) {
      if (additionalProperties === undefined) {
        additionalProperties = cloneJson(branch.additionalProperties);
      } else if (stringifyCanonical(additionalProperties) !== stringifyCanonical(branch.additionalProperties)) {
        throw new Error(`AnyOf folding found divergent additionalProperties: ${decisionPath}.`);
      }
    }
  }

  const foldedSchema: Record<string, unknown> = {
    type: 'object',
  };
  const required = [...(requiredIntersection ?? new Set<string>())].sort((left, right) => left.localeCompare(right));

  if (Object.keys(properties).length > 0) {
    foldedSchema.properties = sortRecord(properties);
  }

  if (required.length > 0) {
    foldedSchema.required = required;
  }

  if (additionalProperties !== undefined) {
    foldedSchema.additionalProperties = additionalProperties;
  }

  return foldedSchema;
}

/** Adds branch properties to the merged schema and rejects divergent duplicate schemas. */
function mergeBranchProperties(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  decisionPath: string,
): void {
  for (const [propertyName, propertySchema] of Object.entries(source)) {
    const existing = target[propertyName];

    if (existing === undefined) {
      target[propertyName] = cloneJson(propertySchema);
      continue;
    }

    if (stringifyCanonical(existing) !== stringifyCanonical(propertySchema)) {
      throw new Error(`AnyOf folding found divergent schema for property ${propertyName}: ${decisionPath}.`);
    }
  }
}

/** Intersects one branch's required array with the accumulated required set. */
function intersectRequired(current: Set<string> | null, value: unknown): Set<string> {
  const required = new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

  if (current === null) {
    return required;
  }

  return new Set([...current].filter((item) => required.has(item)));
}

/** Replaces the approved anyOf while preserving non-structural siblings from the target schema. */
function replaceSchemaWithFoldedAnyOf(
  schema: Record<string, unknown>,
  foldedSchema: Record<string, unknown>,
): void {
  const siblings = cloneJson(schema);

  for (const key of Object.keys(schema)) {
    delete schema[key];
  }

  Object.assign(schema, foldedSchema);

  for (const [key, value] of Object.entries(siblings)) {
    if (key !== 'anyOf' && schema[key] === undefined) {
      schema[key] = value;
    }
  }
}

function isObjectSchema(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const type = value.type;

  return type === 'object' || (Array.isArray(type) && type.includes('object')) || isRecord(value.properties);
}

function getPlainRef(schema: Record<string, unknown>): string | null {
  const keys = Object.keys(schema);

  if (keys.length !== 1 || typeof schema.$ref !== 'string') {
    return null;
  }

  return schema.$ref;
}

/** Resolves local JSON Pointer refs inside the temporary comparison document. */
function resolveLocalRef(root: Record<string, unknown>, ref: string): unknown {
  if (!ref.startsWith('#/')) {
    return null;
  }

  let current: unknown = root;

  for (const segment of ref.slice(2).split('/').map(unescapeJsonPointerSegment)) {
    if (!isRecord(current) && !Array.isArray(current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value;
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function isNullSchema(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const type = value.type;

  return type === 'null' || (Array.isArray(type) && type.length === 1 && type[0] === 'null');
}

function addNullType(schema: Record<string, unknown>): void {
  const type = schema.type;

  if (typeof type === 'string') {
    schema.type = type === 'null' ? type : [type, 'null'];
    return;
  }

  if (Array.isArray(type)) {
    schema.type = type.includes('null') ? type : [...type, 'null'];
  }
}

function formatRuleIdentity(rule: AnyOfFoldingRule): string {
  return `${rule.operation.method.toUpperCase()} ${rule.operation.path}`;
}

function formatRuleDecisionPath(rule: AnyOfFoldingRule): string {
  const operation = formatRuleIdentity(rule);

  if (rule.request) {
    return `${operation} request ${rule.request.mediaType} ${rule.schemaPath}`;
  }

  if (rule.response) {
    return `${operation} response ${rule.response.status} ${rule.response.mediaType} ${rule.schemaPath}`;
  }

  return `${operation} ${rule.schemaPath}`;
}

function stringifyCanonical(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (!isRecord(value)) {
    return value;
  }

  const sorted: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right))) {
    sorted[key] = canonicalize(child);
  }

  return sorted;
}

function sortRecord(value: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right))) {
    sorted[key] = child;
  }

  return sorted;
}

function unescapeJsonPointerSegment(value: string): string {
  return value.replaceAll('~1', '/').replaceAll('~0', '~');
}
