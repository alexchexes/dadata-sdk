import { resolve } from 'node:path';

import YAML from 'yaml';

import type { AnyOfFoldingRule } from './anyof-folding.js';
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
  const record = requireRecord(value, `comparison.anyOfFolding[${index}]`);
  const operation = requireRecord(record.operation, `comparison.anyOfFolding[${index}].operation`);
  const request = record.request;
  const response = record.response;

  if ((request === undefined) === (response === undefined)) {
    throw new Error(`comparison.anyOfFolding[${index}] must specify exactly one of request or response.`);
  }

  return {
    operation: {
      method: requireHttpMethod(operation.method, `comparison.anyOfFolding[${index}].operation.method`),
      path: requireString(operation.path, `comparison.anyOfFolding[${index}].operation.path`),
    },
    request:
      request === undefined
        ? undefined
        : {
            mediaType: requireString(
              requireRecord(request, `comparison.anyOfFolding[${index}].request`).mediaType,
              `comparison.anyOfFolding[${index}].request.mediaType`,
            ),
          },
    response: response === undefined ? undefined : parseAnyOfFoldingResponse(response, index),
    schemaPath: requireString(record.schemaPath, `comparison.anyOfFolding[${index}].schemaPath`),
    target: requireTarget(record.target, `comparison.anyOfFolding[${index}].target`),
  };
}

/** Parses the response selector for one anyOf folding rule. */
function parseAnyOfFoldingResponse(value: unknown, index: number): AnyOfFoldingRule['response'] {
  const response = requireRecord(value, `comparison.anyOfFolding[${index}].response`);

  return {
    mediaType: requireString(response.mediaType, `comparison.anyOfFolding[${index}].response.mediaType`),
    status: requireString(response.status, `comparison.anyOfFolding[${index}].response.status`),
  };
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path} must be a non-empty string.`);
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
