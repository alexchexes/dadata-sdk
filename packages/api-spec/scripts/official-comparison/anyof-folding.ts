import type { OpenAPIV3_1 } from '@scalar/openapi-types';

import type { ComparisonNormalizationDecision } from './comparison-normalization.js';
import { cloneJson, isRecord } from './io.js';
import {
  escapeJsonPointerSegment,
  parseCanonicalLocalRef,
  unescapeJsonPointerSegment,
} from './json-pointer.js';
import type { HttpMethod } from './openapi.js';

export interface ExpectedObjectBranch {
  onlyProperties: string[];
  onlyRequired: string[];
  ref: string;
}

export interface AllowedRecursiveMerge {
  expectedBranchCount?: number;
  expectedBranchRefs: string[];
  expectedObjectBranches?: ExpectedObjectBranch[];
  kind: 'array' | 'object';
  schemaPath: string;
}

export interface AnyOfFoldingRule {
  allowedRecursiveMerges: AllowedRecursiveMerge[];
  expectedNullBranch: boolean;
  expectedObjectBranches: ExpectedObjectBranch[];
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

/** Validates the canonical comparison schema-path grammar. */
export function assertCanonicalSchemaPath(value: string, path: string, allowEmpty: boolean): void {
  if (value === '') {
    if (allowEmpty) {
      return;
    }

    throw new Error(`${path} must not be empty.`);
  }

  const segments = value.split('/');

  if (segments.some((segment) => segment.length === 0)) {
    throw new Error(`${path} must not contain empty path segments.`);
  }

  for (let index = 0; index < segments.length; ) {
    const segment = segments[index];

    if (segment === 'items') {
      index += 1;
      continue;
    }

    if (segment !== 'properties' || index + 1 >= segments.length) {
      throw new Error(`${path} must use only properties/<escaped-name> and items segments.`);
    }

    const propertySegment = segments[index + 1] ?? '';

    if (escapeJsonPointerSegment(unescapeJsonPointerSegment(propertySegment)) !== propertySegment) {
      throw new Error(`${path} contains a noncanonical JSON Pointer property segment.`);
    }

    index += 2;
  }
}

interface MergeContext {
  permissions: Map<string, AllowedRecursiveMerge>;
  root: Record<string, unknown>;
  rulePath: string;
  usedPermissions: Set<string>;
}

interface ResolvedSchema {
  ref: string | null;
  schema: Record<string, unknown>;
}

const ANNOTATION_KEYS = new Set(['description']);
const COMPOSITION_TARGET_KEYS = new Set(['anyOf', ...ANNOTATION_KEYS]);
const OBJECT_KEYS = new Set([
  'additionalProperties',
  'description',
  'properties',
  'required',
  'type',
]);
const ARRAY_KEYS = new Set(['description', 'items', 'type']);

/** Applies explicitly approved, fail-closed object-anyOf folds to path-local operation schemas. */
export function applyAnyOfFoldingRules(
  document: OpenAPIV3_1.Document,
  rules: AnyOfFoldingRule[],
): ComparisonNormalizationDecision[] {
  const root = document as unknown as Record<string, unknown>;
  const decisions: ComparisonNormalizationDecision[] = [];

  for (const rule of rules) {
    assertCanonicalSchemaPath(rule.schemaPath, `${formatRuleIdentity(rule)} schemaPath`, true);
    const schema = findOperationSchema(document, root, rule);
    const targetSchema = materializeSchemaPath(
      root,
      schema,
      rule.schemaPath,
      formatRuleIdentity(rule),
    );
    const decisionPath = formatRuleDecisionPath(rule);
    const context = createMergeContext(root, rule, decisionPath);
    const decision = foldObjectAnyOf(targetSchema, rule, context);

    assertAllPermissionsUsed(context);
    decisions.push(decision);
  }

  return decisions;
}

function createMergeContext(
  root: Record<string, unknown>,
  rule: AnyOfFoldingRule,
  rulePath: string,
): MergeContext {
  const permissions = new Map<string, AllowedRecursiveMerge>();

  for (const permission of rule.allowedRecursiveMerges) {
    assertCanonicalSchemaPath(
      permission.schemaPath,
      `${rulePath} recursive merge schemaPath`,
      false,
    );

    if (permissions.has(permission.schemaPath)) {
      throw new Error(
        `AnyOf folding has duplicate recursive merge permission ${permission.schemaPath}: ${rulePath}.`,
      );
    }

    permissions.set(permission.schemaPath, permission);
  }

  return {
    permissions,
    root,
    rulePath,
    usedPermissions: new Set(),
  };
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

  throw new Error(
    `AnyOf folding rule must specify request or response: ${formatRuleIdentity(rule)}.`,
  );
}

/** Finds and materializes the media schema for one request folding rule. */
function findRequestSchema(
  root: Record<string, unknown>,
  operation: Record<string, unknown>,
  rule: AnyOfFoldingRule,
): Record<string, unknown> {
  const mediaType = rule.request?.mediaType;
  const requestBody = requireRecord(
    operation.requestBody,
    `requestBody for ${formatRuleIdentity(rule)}`,
  );
  const content = requireRecord(
    requestBody.content,
    `requestBody.content for ${formatRuleIdentity(rule)}`,
  );
  const media = requireRecord(
    content[mediaType ?? ''],
    `request media ${mediaType} for ${formatRuleIdentity(rule)}`,
  );

  return materializeSchemaProperty(
    root,
    media,
    'schema',
    `request schema for ${formatRuleIdentity(rule)}`,
  );
}

/** Finds and materializes the media schema for one response folding rule. */
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
  const content = requireRecord(
    responseObject.content,
    `response.content for ${formatRuleIdentity(rule)}`,
  );
  const media = requireRecord(
    content[response?.mediaType ?? ''],
    `response media ${response?.mediaType} for ${formatRuleIdentity(rule)}`,
  );

  return materializeSchemaProperty(
    root,
    media,
    'schema',
    `response schema for ${formatRuleIdentity(rule)}`,
  );
}

/** Follows a compact schema path through properties/items, materializing refs on that path. */
function materializeSchemaPath(
  root: Record<string, unknown>,
  schema: Record<string, unknown>,
  schemaPath: string,
  ruleIdentity: string,
): Record<string, unknown> {
  assertCanonicalSchemaPath(schemaPath, `${ruleIdentity} schemaPath`, true);

  const segments = schemaPath === '' ? [] : schemaPath.split('/');
  let current = schema;

  for (let index = 0; index < segments.length; ) {
    const segment = segments[index] ?? '';

    if (segment === 'items') {
      current = materializeSchemaProperty(
        root,
        current,
        'items',
        `${ruleIdentity} schemaPath ${schemaPath}`,
      );
      index += 1;
      continue;
    }

    const propertySegment = segments[index + 1] ?? '';
    const propertyName = unescapeJsonPointerSegment(propertySegment);
    const prefix = segments.slice(0, index).join('/') || '<schema>';
    const properties = requireRecord(current.properties, `${ruleIdentity} properties at ${prefix}`);

    current = materializeSchemaProperty(
      root,
      properties,
      propertyName,
      `${ruleIdentity} property ${propertyName} in schemaPath ${schemaPath}`,
    );
    index += 2;
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

  const materialized = materializeSchema(root, value, context);

  if (materialized !== value) {
    owner[key] = materialized;
  }

  return materialized;
}

/** Clones a local $ref schema target and preserves non-$ref siblings. */
function materializeSchema(
  root: Record<string, unknown>,
  schema: Record<string, unknown>,
  context: string,
  visitedRefs = new Set<string>(),
): Record<string, unknown> {
  if (!('$ref' in schema)) {
    return schema;
  }

  if (typeof schema.$ref !== 'string') {
    throw new Error(`${context} has a non-string $ref.`);
  }

  assertRefHasOnlyAnnotationSiblings(schema, context);
  const ref = schema.$ref;

  if (visitedRefs.has(ref)) {
    throw new Error(`${context} has a cyclic local $ref chain at ${ref}.`);
  }

  const resolved = resolveLocalRef(root, ref, context);

  if (!isRecord(resolved)) {
    throw new Error(`Failed to resolve local schema ref ${ref}.`);
  }

  const nextVisitedRefs = new Set(visitedRefs);
  nextVisitedRefs.add(ref);
  const materialized = materializeSchema(
    root,
    cloneJson(resolved),
    `${context} -> ${ref}`,
    nextVisitedRefs,
  );

  for (const [key, value] of Object.entries(schema)) {
    if (key !== '$ref') {
      materialized[key] = cloneJson(value);
    }
  }

  return materialized;
}

/** Folds the explicitly expected root anyOf into one comparison-only object schema. */
function foldObjectAnyOf(
  schema: Record<string, unknown>,
  rule: AnyOfFoldingRule,
  context: MergeContext,
): ComparisonNormalizationDecision {
  const anyOf = schema.anyOf;

  if (!Array.isArray(anyOf) || anyOf.length === 0) {
    throw new Error(`AnyOf folding target is missing a non-empty anyOf: ${context.rulePath}.`);
  }

  assertAllowedKeys(schema, COMPOSITION_TARGET_KEYS, '', context);
  const branches = anyOf.map((branch) =>
    resolveSchemaForMerge(branch, context.root, context.rulePath),
  );
  const nullBranches = branches.filter((branch) => isNullSchema(branch.schema));
  const objectBranches = branches.filter((branch) => !isNullSchema(branch.schema));

  if ((nullBranches.length === 1) !== rule.expectedNullBranch) {
    throw new Error(`AnyOf folding found an unexpected null-branch shape: ${context.rulePath}.`);
  }

  if (nullBranches.length > 1) {
    throw new Error(`AnyOf folding found multiple null branches: ${context.rulePath}.`);
  }

  for (const nullBranch of nullBranches) {
    assertExactNullBranch(nullBranch, context);
  }

  const foldedSchema = mergeObjectBranches(
    objectBranches,
    rule.expectedObjectBranches,
    '',
    context,
  );

  if (rule.expectedNullBranch) {
    addNullType(foldedSchema);
  }

  replaceSchemaWithFoldedAnyOf(schema, foldedSchema);

  return {
    branchRefs: objectBranches.map((branch) => requireBranchRef(branch, context.rulePath)),
    compositionKey: 'anyOf',
    kind: 'folded-object-anyof',
    objectBranchCount: objectBranches.length,
    path: context.rulePath,
  };
}

/** Merges object branches only after their exact branch-local differences are confirmed. */
function mergeObjectBranches(
  branches: ResolvedSchema[],
  expectedBranches: ExpectedObjectBranch[],
  schemaPath: string,
  context: MergeContext,
): Record<string, unknown> {
  assertExpectedObjectBranches(branches, expectedBranches, schemaPath, context);

  const propertyMaps = branches.map((branch) =>
    requireRecord(branch.schema.properties, `properties at ${pathLabel(schemaPath, context)}`),
  );
  const requiredSets = branches.map((branch) =>
    readRequired(branch.schema.required, schemaPath, context),
  );
  assertBranchLocalDifferences(
    branches,
    propertyMaps,
    requiredSets,
    expectedBranches,
    schemaPath,
    context,
  );

  const properties: Record<string, unknown> = {};
  const propertyNames = new Set(
    propertyMaps.flatMap((propertiesForBranch) => Object.keys(propertiesForBranch)),
  );

  for (const propertyName of [...propertyNames].sort((left, right) => left.localeCompare(right))) {
    const propertySchemas = propertyMaps
      .map((propertiesForBranch) => propertiesForBranch[propertyName])
      .filter((value): value is unknown => value !== undefined);
    const propertyPath = joinSchemaPath(
      schemaPath,
      `properties/${escapeJsonPointerSegment(propertyName)}`,
    );

    properties[propertyName] = mergeSchemaVariants(propertySchemas, propertyPath, context);
  }

  const foldedSchema: Record<string, unknown> = {
    type: 'object',
  };
  const required = intersectSets(requiredSets);
  const additionalProperties = mergeIdenticalKeyword(
    branches,
    'additionalProperties',
    schemaPath,
    context,
  );

  if (Object.keys(properties).length > 0) {
    foldedSchema.properties = properties;
  }

  if (required.size > 0) {
    foldedSchema.required = [...required].sort((left, right) => left.localeCompare(right));
  }

  if (additionalProperties !== undefined) {
    foldedSchema.additionalProperties = additionalProperties;
  }

  return foldedSchema;
}

function mergeSchemaVariants(
  variants: unknown[],
  schemaPath: string,
  context: MergeContext,
): unknown {
  const first = variants[0];

  if (variants.every((variant) => stringifyCanonical(variant) === stringifyCanonical(first))) {
    return cloneJson(first);
  }

  const permission = context.permissions.get(schemaPath);

  if (!permission) {
    throw new Error(
      `AnyOf folding found an unapproved divergent schema at ${pathLabel(schemaPath, context)}.`,
    );
  }

  context.usedPermissions.add(schemaPath);

  if (
    permission.expectedBranchCount !== undefined &&
    variants.length !== permission.expectedBranchCount
  ) {
    throw new Error(
      `AnyOf folding found an unexpected branch count at ${pathLabel(schemaPath, context)}.`,
    );
  }

  const resolved = variants.map((variant) =>
    resolveSchemaForMerge(variant, context.root, pathLabel(schemaPath, context)),
  );
  assertExpectedRefs(
    resolved,
    permission.expectedBranchRefs,
    schemaPath,
    context,
    permission.kind === 'object',
  );

  if (permission.kind === 'object') {
    return mergeObjectBranches(
      resolved,
      permission.expectedObjectBranches ?? [],
      schemaPath,
      context,
    );
  }

  if (permission.expectedObjectBranches !== undefined) {
    throw new Error(
      `Array merge permission must not define expectedObjectBranches: ${pathLabel(schemaPath, context)}.`,
    );
  }

  return mergeArrayBranches(resolved, schemaPath, context);
}

/** Merges arrays only when every schema keyword except their explicitly merged items is identical. */
function mergeArrayBranches(
  branches: ResolvedSchema[],
  schemaPath: string,
  context: MergeContext,
): Record<string, unknown> {
  for (const branch of branches) {
    assertAllowedKeys(branch.schema, ARRAY_KEYS, schemaPath, context);

    if (branch.schema.type !== 'array') {
      throw new Error(`AnyOf folding expected an array at ${pathLabel(schemaPath, context)}.`);
    }
  }

  const folded = cloneJson(branches[0]?.schema ?? {});
  const items = branches.map((branch) => branch.schema.items);

  if (items.some((item) => !isRecord(item))) {
    throw new Error(
      `AnyOf folding requires schema-object array items at ${pathLabel(schemaPath, context)}.`,
    );
  }

  for (const key of Object.keys(folded)) {
    if (ANNOTATION_KEYS.has(key)) {
      delete folded[key];
    } else if (key !== 'items') {
      folded[key] = mergeIdenticalKeyword(branches, key, schemaPath, context);
    }
  }

  folded.items = mergeSchemaVariants(items, joinSchemaPath(schemaPath, 'items'), context);

  return folded;
}

function assertExpectedObjectBranches(
  branches: ResolvedSchema[],
  expectedBranches: ExpectedObjectBranch[],
  schemaPath: string,
  context: MergeContext,
): void {
  assertExpectedRefs(
    branches,
    expectedBranches.map((branch) => branch.ref),
    schemaPath,
    context,
    true,
  );

  if (branches.length < 2) {
    throw new Error(
      `AnyOf folding requires at least two object branches at ${pathLabel(schemaPath, context)}.`,
    );
  }

  for (const branch of branches) {
    assertAllowedKeys(branch.schema, OBJECT_KEYS, schemaPath, context);

    if (branch.schema.type !== 'object') {
      throw new Error(`AnyOf folding expected an object at ${pathLabel(schemaPath, context)}.`);
    }
  }
}

function assertBranchLocalDifferences(
  branches: ResolvedSchema[],
  propertyMaps: Record<string, unknown>[],
  requiredSets: Set<string>[],
  expectedBranches: ExpectedObjectBranch[],
  schemaPath: string,
  context: MergeContext,
): void {
  const commonProperties = intersectSets(
    propertyMaps.map((properties) => new Set(Object.keys(properties))),
  );
  const commonRequired = intersectSets(requiredSets);
  const expectedByRef = new Map(expectedBranches.map((branch) => [branch.ref, branch]));

  for (let index = 0; index < branches.length; index += 1) {
    const ref = requireBranchRef(branches[index], pathLabel(schemaPath, context));
    const expected = expectedByRef.get(ref);

    if (!expected) {
      throw new Error(
        `AnyOf folding has no expectation for branch ${ref}: ${pathLabel(schemaPath, context)}.`,
      );
    }

    assertStringSetEqual(
      difference(new Set(Object.keys(propertyMaps[index] ?? {})), commonProperties),
      new Set(expected.onlyProperties),
      `branch-only properties for ${ref} at ${pathLabel(schemaPath, context)}`,
    );
    assertStringSetEqual(
      difference(requiredSets[index] ?? new Set(), commonRequired),
      new Set(expected.onlyRequired),
      `branch-only required fields for ${ref} at ${pathLabel(schemaPath, context)}`,
    );
  }
}

function assertExpectedRefs(
  branches: ResolvedSchema[],
  expectedRefs: string[],
  schemaPath: string,
  context: MergeContext,
  requireEveryBranchRef: boolean,
): void {
  const actualRefs = branches.flatMap((branch) => (branch.ref ? [branch.ref] : []));

  if (requireEveryBranchRef && actualRefs.length !== branches.length) {
    throw new Error(
      `AnyOf folding requires explicitly referenced branches at ${pathLabel(schemaPath, context)}.`,
    );
  }

  if (
    actualRefs.length !== expectedRefs.length ||
    actualRefs.some((ref, index) => ref !== expectedRefs[index])
  ) {
    throw new Error(
      `AnyOf folding found unexpected ordered branch refs at ${pathLabel(schemaPath, context)}: expected [${expectedRefs.join(
        ', ',
      )}], actual [${actualRefs.join(', ')}].`,
    );
  }
}

function assertAllowedKeys(
  schema: Record<string, unknown>,
  allowedKeys: Set<string>,
  schemaPath: string,
  context: MergeContext,
): void {
  const unexpected = Object.keys(schema).filter((key) => !allowedKeys.has(key));

  if (unexpected.length > 0) {
    throw new Error(
      `AnyOf folding found unsupported schema keywords ${unexpected.sort().join(', ')} at ${pathLabel(schemaPath, context)}.`,
    );
  }
}

function assertAllPermissionsUsed(context: MergeContext): void {
  const unused = [...context.permissions.keys()].filter(
    (path) => !context.usedPermissions.has(path),
  );

  if (unused.length > 0) {
    throw new Error(
      `AnyOf folding has stale recursive merge permissions ${unused.sort().join(', ')}: ${context.rulePath}.`,
    );
  }
}

function resolveSchemaForMerge(
  value: unknown,
  root: Record<string, unknown>,
  path: string,
): ResolvedSchema {
  if (!isRecord(value)) {
    throw new Error(`AnyOf folding branch must be a schema object: ${path}.`);
  }

  const ref = typeof value.$ref === 'string' ? value.$ref : null;

  return {
    ref,
    schema: ref ? materializeSchema(root, value, path) : value,
  };
}

function assertRefHasOnlyAnnotationSiblings(schema: Record<string, unknown>, path: string): void {
  const unsupportedSiblings = Object.keys(schema).filter(
    (key) => key !== '$ref' && !ANNOTATION_KEYS.has(key),
  );

  if (unsupportedSiblings.length > 0) {
    throw new Error(
      `AnyOf folding found structural $ref siblings ${unsupportedSiblings.sort().join(', ')} at ${path}.`,
    );
  }
}

function assertExactNullBranch(branch: ResolvedSchema, context: MergeContext): void {
  if (branch.ref || stringifyCanonical(branch.schema) !== '{"type":"null"}') {
    throw new Error(`AnyOf folding requires the exact null schema at ${context.rulePath}.`);
  }
}

function mergeIdenticalKeyword(
  branches: ResolvedSchema[],
  key: string,
  schemaPath: string,
  context: MergeContext,
): unknown {
  const values = branches.map((branch) => branch.schema[key]);
  const first = values[0];

  if (!values.every((value) => stringifyCanonical(value) === stringifyCanonical(first))) {
    throw new Error(`AnyOf folding found divergent ${key} at ${pathLabel(schemaPath, context)}.`);
  }

  return first === undefined ? undefined : cloneJson(first);
}

function readRequired(value: unknown, schemaPath: string, context: MergeContext): Set<string> {
  if (value === undefined) {
    return new Set();
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(
      `AnyOf folding found invalid required fields at ${pathLabel(schemaPath, context)}.`,
    );
  }

  const required = new Set(value);

  if (required.size !== value.length) {
    throw new Error(
      `AnyOf folding found duplicate required fields at ${pathLabel(schemaPath, context)}.`,
    );
  }

  return required as Set<string>;
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

/** Resolves canonical local JSON Pointer refs inside the temporary comparison document. */
function resolveLocalRef(root: Record<string, unknown>, ref: string, context: string): unknown {
  let current: unknown = root;

  for (const segment of parseCanonicalLocalRef(ref, `${context} $ref`)) {
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

function requireBranchRef(branch: ResolvedSchema | undefined, path: string): string {
  if (!branch?.ref) {
    throw new Error(`AnyOf folding requires explicitly referenced object branches at ${path}.`);
  }

  return branch.ref;
}

function isNullSchema(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const type = value.type;

  return type === 'null' || (Array.isArray(type) && type.length === 1 && type[0] === 'null');
}

function addNullType(schema: Record<string, unknown>): void {
  schema.type = ['object', 'null'];
}

function formatRuleIdentity(rule: AnyOfFoldingRule): string {
  return `${rule.operation.method.toUpperCase()} ${rule.operation.path}`;
}

function formatRuleDecisionPath(rule: AnyOfFoldingRule): string {
  const operation = formatRuleIdentity(rule);
  const schemaPath = rule.schemaPath ? ` ${rule.schemaPath}` : '';

  if (rule.request) {
    return `${operation} request ${rule.request.mediaType}${schemaPath}`;
  }

  if (rule.response) {
    return `${operation} response ${rule.response.status} ${rule.response.mediaType}${schemaPath}`;
  }

  return `${operation}${schemaPath}`;
}

function pathLabel(schemaPath: string, context: MergeContext): string {
  return `${context.rulePath} ${schemaPath || '<schema>'}`;
}

function joinSchemaPath(parent: string, child: string): string {
  return parent ? `${parent}/${child}` : child;
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

  for (const [key, child] of Object.entries(value).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    sorted[key] = canonicalize(child);
  }

  return sorted;
}

function intersectSets(sets: Set<string>[]): Set<string> {
  const first = sets[0] ?? new Set<string>();

  return new Set([...first].filter((item) => sets.every((set) => set.has(item))));
}

function difference(left: Set<string>, right: Set<string>): Set<string> {
  return new Set([...left].filter((item) => !right.has(item)));
}

function assertStringSetEqual(actual: Set<string>, expected: Set<string>, label: string): void {
  if (actual.size !== expected.size || [...actual].some((item) => !expected.has(item))) {
    throw new Error(
      `AnyOf folding found unexpected ${label}: expected [${[...expected].sort().join(', ')}], actual [${[
        ...actual,
      ]
        .sort()
        .join(', ')}].`,
    );
  }
}
