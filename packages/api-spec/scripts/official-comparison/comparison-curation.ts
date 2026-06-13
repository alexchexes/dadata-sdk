import { resolve } from 'node:path';
import YAML from 'yaml';

import {
  type AllowedRecursiveMerge,
  type AnyOfFoldingRule,
  type ExpectedObjectBranch,
  assertCanonicalSchemaPath,
} from './anyof-folding.js';
import { isRecord, readText } from './io.js';
import { HTTP_METHODS, type HttpMethod } from './openapi.js';

export interface ComparisonCuration {
  anyOfFolding: AnyOfFoldingRule[];
}

/** Reads Stage B comparison curation from the shared official suggestions curation file. */
export function readComparisonCuration(
  curationPath: string | null,
  defaultCurationPath: string,
): ComparisonCuration {
  if (curationPath === '-') {
    throw new Error('Stage B comparison curation cannot be read from stdin.');
  }

  const path = curationPath ? resolve(curationPath) : defaultCurationPath;
  const parsed = YAML.parse(readText(path)) as unknown;

  if (!isRecord(parsed)) {
    throw new Error('Suggestions curation must be a YAML object.');
  }

  const comparison = parsed.comparison;

  if (comparison === undefined) {
    return { anyOfFolding: [] };
  }

  if (!isRecord(comparison)) {
    throw new Error('comparison must be an object.');
  }

  return {
    anyOfFolding: parseAnyOfFoldingRules(comparison.anyOfFolding),
  };
}

/** Parses explicit anyOf folding rules from suggestions curation. */
function parseAnyOfFoldingRules(value: unknown): AnyOfFoldingRule[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('comparison.anyOfFolding must be an array.');
  }

  return value.map((item, index) => parseAnyOfFoldingRule(item, index));
}

/** Parses one explicit anyOf folding rule. */
function parseAnyOfFoldingRule(value: unknown, index: number): AnyOfFoldingRule {
  const path = `comparison.anyOfFolding[${index}]`;
  const record = requireRecord(value, path);
  const operation = requireRecord(record.operation, `${path}.operation`);
  const request = record.request;
  const response = record.response;

  assertOnlyKeys(
    record,
    [
      'allowedRecursiveMerges',
      'expectedNullBranch',
      'expectedObjectBranches',
      'operation',
      'request',
      'response',
      'schemaPath',
      'target',
    ],
    path,
  );
  assertOnlyKeys(operation, ['method', 'path'], `${path}.operation`);

  if ((request === undefined) === (response === undefined)) {
    throw new Error(`${path} must specify exactly one of request or response.`);
  }

  return {
    allowedRecursiveMerges: parseAllowedRecursiveMerges(record.allowedRecursiveMerges, path),
    expectedNullBranch: requireBoolean(record.expectedNullBranch, `${path}.expectedNullBranch`),
    expectedObjectBranches: parseExpectedObjectBranches(
      record.expectedObjectBranches,
      `${path}.expectedObjectBranches`,
    ),
    operation: {
      method: requireHttpMethod(operation.method, `${path}.operation.method`),
      path: requireString(operation.path, `${path}.operation.path`),
    },
    request:
      request === undefined
        ? undefined
        : {
            mediaType: requireString(
              requireSelector(request, `${path}.request`).mediaType,
              `${path}.request.mediaType`,
            ),
          },
    response: response === undefined ? undefined : parseAnyOfFoldingResponse(response, index),
    schemaPath: requireSchemaPath(record.schemaPath, `${path}.schemaPath`, true),
    target: requireTarget(record.target, `${path}.target`),
  };
}

/** Parses the response selector for one anyOf folding rule. */
function parseAnyOfFoldingResponse(value: unknown, index: number): AnyOfFoldingRule['response'] {
  const path = `comparison.anyOfFolding[${index}].response`;
  const response = requireRecord(value, path);

  assertOnlyKeys(response, ['mediaType', 'status'], path);

  return {
    mediaType: requireString(response.mediaType, `${path}.mediaType`),
    status: requireString(response.status, `${path}.status`),
  };
}

function parseAllowedRecursiveMerges(value: unknown, parentPath: string): AllowedRecursiveMerge[] {
  const path = `${parentPath}.allowedRecursiveMerges`;

  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array.`);
  }

  return value.map((item, index) => {
    const itemPath = `${path}[${index}]`;
    const record = requireRecord(item, itemPath);
    const kind = requireMergeKind(record.kind, `${itemPath}.kind`);

    assertOnlyKeys(
      record,
      kind === 'array'
        ? ['expectedBranchCount', 'expectedBranchRefs', 'kind', 'schemaPath']
        : ['expectedObjectBranches', 'kind', 'schemaPath'],
      itemPath,
    );

    if (kind === 'array') {
      return {
        expectedBranchCount: requirePositiveInteger(
          record.expectedBranchCount,
          `${itemPath}.expectedBranchCount`,
        ),
        expectedBranchRefs: requireStringArray(
          record.expectedBranchRefs,
          `${itemPath}.expectedBranchRefs`,
        ),
        kind,
        schemaPath: requireSchemaPath(record.schemaPath, `${itemPath}.schemaPath`, false),
      };
    }

    const expectedObjectBranches = parseExpectedObjectBranches(
      record.expectedObjectBranches,
      `${itemPath}.expectedObjectBranches`,
    );

    return {
      expectedBranchRefs: expectedObjectBranches.map((branch) => branch.ref),
      expectedObjectBranches,
      kind,
      schemaPath: requireSchemaPath(record.schemaPath, `${itemPath}.schemaPath`, false),
    };
  });
}

function parseExpectedObjectBranches(value: unknown, path: string): ExpectedObjectBranch[] {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`${path} must be an array with at least two branches.`);
  }

  const branches = value.map((item, index) => {
    const itemPath = `${path}[${index}]`;
    const record = requireRecord(item, itemPath);

    assertOnlyKeys(record, ['onlyProperties', 'onlyRequired', 'ref'], itemPath);

    return {
      onlyProperties: requireStringArray(record.onlyProperties, `${itemPath}.onlyProperties`),
      onlyRequired: requireStringArray(record.onlyRequired, `${itemPath}.onlyRequired`),
      ref: requireString(record.ref, `${itemPath}.ref`),
    };
  });

  if (new Set(branches.map((branch) => branch.ref)).size !== branches.length) {
    throw new Error(`${path} must not contain duplicate branch refs.`);
  }

  return branches;
}

function requireSelector(value: unknown, path: string): Record<string, unknown> {
  const selector = requireRecord(value, path);

  assertOnlyKeys(selector, ['mediaType'], path);

  return selector;
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value;
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${path} must be a boolean.`);
  }

  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path} must be a non-empty string.`);
  }

  return value;
}

function requireSchemaPath(value: unknown, path: string, allowEmpty: boolean): string {
  if (typeof value !== 'string') {
    throw new Error(`${path} must be a string.`);
  }

  assertCanonicalSchemaPath(value, path, allowEmpty);

  return value;
}

function requireStringArray(value: unknown, path: string): string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== 'string' || item.length === 0)
  ) {
    throw new Error(`${path} must be an array of non-empty strings.`);
  }

  if (new Set(value).size !== value.length) {
    throw new Error(`${path} must not contain duplicates.`);
  }

  return value as string[];
}

function requirePositiveInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error(`${path} must be a positive integer.`);
  }

  return value as number;
}

function requireMergeKind(value: unknown, path: string): AllowedRecursiveMerge['kind'] {
  if (value !== 'array' && value !== 'object') {
    throw new Error(`${path} must be "array" or "object".`);
  }

  return value;
}

function requireHttpMethod(value: unknown, path: string): HttpMethod {
  const method = requireString(value, path).toLowerCase();

  if (!HTTP_METHODS.includes(method as HttpMethod)) {
    throw new Error(`${path} must be one of: ${HTTP_METHODS.join(', ')}.`);
  }

  return method as HttpMethod;
}

function requireTarget(value: unknown, path: string): AnyOfFoldingRule['target'] {
  if (value !== 'official' && value !== 'ours') {
    throw new Error(`${path} must be "official" or "ours".`);
  }

  return value;
}

function assertOnlyKeys(record: Record<string, unknown>, allowed: string[], path: string): void {
  const allowedSet = new Set(allowed);
  const unexpected = Object.keys(record).filter((key) => !allowedSet.has(key));

  if (unexpected.length > 0) {
    throw new Error(`${path} has unexpected keys: ${unexpected.sort().join(', ')}.`);
  }
}
