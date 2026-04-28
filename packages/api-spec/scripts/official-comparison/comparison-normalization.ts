import type { OpenAPIV3_1 } from '@scalar/openapi-types';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
type CompositionKey = 'anyOf' | 'oneOf';

export const COMPARISON_INFO = {
  title: 'DaData suggestions comparison',
  version: '0.0.0',
};

const HTTP_METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export function normalizeComparisonDocument(
  document: OpenAPIV3_1.Document,
  openapiVersion: string,
): void {
  const root = document as unknown as Record<string, unknown>;

  root.openapi = openapiVersion;
  root.info = cloneJson(COMPARISON_INFO);
  delete root.servers;
  delete root.security;
  delete root.tags;
  delete root.externalDocs;

  const components = root.components;

  if (isRecord(components)) {
    delete components.securitySchemes;
  }

  normalizeNullableSchemas(root);
  normalizeComparisonOperations(document);
}

function normalizeComparisonOperations(document: OpenAPIV3_1.Document): void {
  for (const pathItem of Object.values(document.paths ?? {})) {
    if (!isRecord(pathItem)) {
      continue;
    }

    delete pathItem.servers;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (!isRecord(operation)) {
        continue;
      }

      delete operation.tags;
      delete operation.summary;
      delete operation.description;
      delete operation.externalDocs;
      delete operation.operationId;
      delete operation.security;
      delete operation.servers;

      for (const key of Object.keys(operation)) {
        if (key.startsWith('x-')) {
          delete operation[key];
        }
      }
    }
  }
}

function normalizeNullableSchemas(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      normalizeNullableSchemas(item);
    }

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  canonicalizeNullableComposition(value);

  if (value.nullable === true) {
    delete value.nullable;
    addNullType(value);
    addNullEnumValue(value);
  } else if (value.nullable === false) {
    delete value.nullable;
  }

  for (const child of Object.values(value)) {
    normalizeNullableSchemas(child);
  }
}

function canonicalizeNullableComposition(schema: Record<string, unknown>): void {
  const compositionKey = getNullableCompositionKey(schema);

  if (!compositionKey) {
    return;
  }

  const composition = schema[compositionKey];

  if (!Array.isArray(composition) || composition.length !== 2) {
    return;
  }

  const nullBranchIndex = composition.findIndex(isNullSchema);

  if (nullBranchIndex === -1) {
    return;
  }

  const nonNullBranch = composition[nullBranchIndex === 0 ? 1 : 0];

  if (!isRecord(nonNullBranch) || !canFlattenNullableBranch(nonNullBranch)) {
    return;
  }

  delete schema[compositionKey];

  for (const [key, value] of Object.entries(nonNullBranch)) {
    if (schema[key] === undefined || key === 'type' || key === 'enum' || key === 'format') {
      schema[key] = cloneJson(value);
    }
  }

  addNullType(schema);
  addNullEnumValue(schema);
}

function getNullableCompositionKey(schema: Record<string, unknown>): CompositionKey | null {
  if (Array.isArray(schema.anyOf)) {
    return 'anyOf';
  }

  if (Array.isArray(schema.oneOf)) {
    return 'oneOf';
  }

  return null;
}

function canFlattenNullableBranch(schema: Record<string, unknown>): boolean {
  return (
    !('$ref' in schema) &&
    !('allOf' in schema) &&
    !('anyOf' in schema) &&
    !('oneOf' in schema) &&
    !('not' in schema) &&
    schema.type !== undefined
  );
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

function addNullEnumValue(schema: Record<string, unknown>): void {
  const enumValues = schema.enum;

  if (!Array.isArray(enumValues) || enumValues.includes(null)) {
    return;
  }

  schema.enum = [...enumValues, null];
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
