import YAML from 'yaml';

import { isRecord } from '../io.js';
import { HTTP_METHODS, type HttpMethod } from '../openapi.js';
import type {
  ExtensionMapping,
  OperationIdentity,
  StageACuration,
  StageAFamilyConfig,
  TemplateExpansionMapping,
} from './types.js';

export function parseStageACuration(source: string, config: StageAFamilyConfig): StageACuration {
  const parsed = YAML.parse(source) as unknown;

  if (!isRecord(parsed)) {
    throw new Error(`${config.family} curation must be a YAML object.`);
  }

  if (parsed.version !== 1) {
    throw new Error(`${config.family} curation must have version: 1.`);
  }

  if (parsed.family !== config.family) {
    throw new Error(`${config.family} curation must have family: ${config.family}.`);
  }

  const operations = requireRecord(parsed.operations, 'operations');

  return {
    version: 1,
    family: config.family,
    operations: {
      templateExpansions: parseTemplateExpansionMappings(operations.templateExpansions),
      extensions: parseExtensionMappings(operations.extensions),
    },
  };
}

function parseTemplateExpansionMappings(value: unknown): TemplateExpansionMapping[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('operations.templateExpansions must be an array.');
  }

  return value.map((item, index) => {
    const record = requireRecord(item, `operations.templateExpansions[${index}]`);
    const our = parseOperationIdentity(record.our, `operations.templateExpansions[${index}].our`);
    const official = requireRecord(record.official, `operations.templateExpansions[${index}].official`);

    return {
      our,
      official: {
        pathTemplate: requireString(
          official.pathTemplate,
          `operations.templateExpansions[${index}].official.pathTemplate`,
        ),
        method: requireHttpMethod(
          official.method,
          `operations.templateExpansions[${index}].official.method`,
        ),
      },
    };
  });
}

function parseExtensionMappings(value: unknown): ExtensionMapping[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('operations.extensions must be an array.');
  }

  return value.map((item, index) => {
    const record = requireRecord(item, `operations.extensions[${index}]`);

    return {
      our: parseOperationIdentity(record.our, `operations.extensions[${index}].our`),
    };
  });
}

function parseOperationIdentity(value: unknown, path: string): OperationIdentity {
  const record = requireRecord(value, path);

  return {
    path: requireString(record.path, `${path}.path`),
    method: requireHttpMethod(record.method, `${path}.method`),
  };
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${path} must be a string.`);
  }

  return value;
}

function requireHttpMethod(value: unknown, path: string): HttpMethod {
  const method = requireString(value, path);

  if (!HTTP_METHODS.includes(method as HttpMethod)) {
    throw new Error(`${path} must be one of: ${HTTP_METHODS.join(', ')}.`);
  }

  return method as HttpMethod;
}
