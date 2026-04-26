import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import YAML from 'yaml';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
type ComparisonUnitKind = 'official-concrete' | 'approved-template-expansion' | 'approved-extension';
type RefIdentity = string | null;

interface OperationRecord {
  path: string;
  method: HttpMethod;
  operation: OpenAPIV3_1.OperationObject;
  requestRef: RefIdentity;
  responseRef: RefIdentity;
}

interface OfficialTemplateOperationRecord extends OperationRecord {
  prefix: string;
}

interface ApprovedTemplateExpansion {
  path: string;
  method: HttpMethod;
  officialPathTemplate: string;
  officialRequestRef: RefIdentity;
  officialResponseRef: RefIdentity;
  ourRequestRef: RefIdentity;
  ourResponseRef: RefIdentity;
  reason?: string;
}

interface ApprovedExtension {
  path: string;
  method: HttpMethod;
  ourRequestRef: RefIdentity;
  ourResponseRef: RefIdentity;
  reason?: string;
}

interface SuggestionsMappingManifest {
  version: 1;
  family: 'suggestions';
  approvedTemplateExpansions: ApprovedTemplateExpansion[];
  approvedExtensions: ApprovedExtension[];
}

interface ComparisonUnit {
  path: string;
  method: HttpMethod;
  kind: ComparisonUnitKind;
  officialSourcePath: string | null;
  officialRequestRef: RefIdentity;
  officialResponseRef: RefIdentity;
  ourRequestRef: RefIdentity;
  ourResponseRef: RefIdentity;
}

interface CompareOptions {
  manifestPath: string | null;
  showAccepted: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const OFFICIAL_PATH_PREFIX = '/api/4_1/rs';
const DEFAULT_MANIFEST_PATH = 'official/suggestions-mappings.yaml';
const STDIN_MANIFEST_PATH = '-';

const options = parseOptions(process.argv.slice(2));
const officialSpec = YAML.parse(
  readFileSync(resolve('official/suggestions.yml'), 'utf8'),
) as OpenAPIV3_1.Document;
const ourSpec = JSON.parse(readFileSync(resolve('dadata.json'), 'utf8')) as OpenAPIV3_1.Document;
const manifest = parseManifest(readManifestSource(options.manifestPath));

const officialOperations = extractOfficialOperations(officialSpec);
const ourFamilyOperations = extractOurFamilyOperations(ourSpec, officialOperations);
const comparison = compareSuggestionsStageA(officialOperations, ourFamilyOperations, manifest);

printReport(comparison.units, comparison.issues, officialOperations, ourFamilyOperations, options);

if (comparison.issues.length > 0) {
  process.exitCode = 1;
}

function compareSuggestionsStageA(
  official: {
    concrete: Map<string, OperationRecord>;
    templates: OfficialTemplateOperationRecord[];
  },
  ours: Map<string, OperationRecord>,
  mappingManifest: SuggestionsMappingManifest,
): {
  units: ComparisonUnit[];
  issues: string[];
} {
  const units: ComparisonUnit[] = [];
  const issues: string[] = [];
  const consumedTemplateApprovals = new Set<string>();
  const consumedExtensionApprovals = new Set<string>();
  const templateApprovals = indexManifestEntries(
    mappingManifest.approvedTemplateExpansions,
    'approvedTemplateExpansions',
    issues,
  );
  const extensionApprovals = indexManifestEntries(
    mappingManifest.approvedExtensions,
    'approvedExtensions',
    issues,
  );

  for (const officialOperation of official.concrete.values()) {
    const operationKeyValue = operationKey(officialOperation.path, officialOperation.method);

    if (!ours.has(operationKeyValue)) {
      issues.push(
        `Official concrete operation is missing in our spec: ${formatOperation(
          officialOperation,
        )}`,
      );
    }
  }

  for (const ourOperation of sortOperationRecords([...ours.values()])) {
    const operationKeyValue = operationKey(ourOperation.path, ourOperation.method);
    const concreteOfficialOperation = official.concrete.get(operationKeyValue);

    if (concreteOfficialOperation) {
      if (templateApprovals.has(operationKeyValue)) {
        issues.push(
          `Template approval is stale because official now declares a concrete operation: ${formatOperation(
            ourOperation,
          )}`,
        );
      }

      if (extensionApprovals.has(operationKeyValue)) {
        issues.push(
          `Extension approval is stale because official now declares a concrete operation: ${formatOperation(
            ourOperation,
          )}`,
        );
      }

      units.push({
        path: ourOperation.path,
        method: ourOperation.method,
        kind: 'official-concrete',
        officialSourcePath: concreteOfficialOperation.path,
        officialRequestRef: concreteOfficialOperation.requestRef,
        officialResponseRef: concreteOfficialOperation.responseRef,
        ourRequestRef: ourOperation.requestRef,
        ourResponseRef: ourOperation.responseRef,
      });
      continue;
    }

    const matchingTemplates = findMatchingTemplateOperations(official.templates, ourOperation);

    if (matchingTemplates.length > 1) {
      issues.push(
        `Operation matches multiple official templates and needs explicit comparator support: ${formatOperation(
          ourOperation,
        )} (${matchingTemplates.map((template) => template.path).join(', ')})`,
      );
      continue;
    }

    const matchingTemplate = matchingTemplates[0];

    if (matchingTemplate) {
      const approval = templateApprovals.get(operationKeyValue);

      if (!approval) {
        issues.push(
          `Generic-derived operation is missing from approvedTemplateExpansions: ${formatOperation(
            ourOperation,
          )} (candidate official template ${matchingTemplate.path})`,
        );
        continue;
      }

      consumedTemplateApprovals.add(operationKeyValue);
      validateTemplateApproval(approval, matchingTemplate, ourOperation, issues);
      units.push({
        path: ourOperation.path,
        method: ourOperation.method,
        kind: 'approved-template-expansion',
        officialSourcePath: matchingTemplate.path,
        officialRequestRef: matchingTemplate.requestRef,
        officialResponseRef: matchingTemplate.responseRef,
        ourRequestRef: ourOperation.requestRef,
        ourResponseRef: ourOperation.responseRef,
      });
      continue;
    }

    const extensionApproval = extensionApprovals.get(operationKeyValue);

    if (!extensionApproval) {
      issues.push(
        `Our operation has no official concrete or template analogue and is missing from approvedExtensions: ${formatOperation(
          ourOperation,
        )}`,
      );
      continue;
    }

    consumedExtensionApprovals.add(operationKeyValue);
    validateExtensionApproval(extensionApproval, ourOperation, issues);
    units.push({
      path: ourOperation.path,
      method: ourOperation.method,
      kind: 'approved-extension',
      officialSourcePath: null,
      officialRequestRef: null,
      officialResponseRef: null,
      ourRequestRef: ourOperation.requestRef,
      ourResponseRef: ourOperation.responseRef,
    });
  }

  for (const approval of mappingManifest.approvedTemplateExpansions) {
    const key = operationKey(approval.path, approval.method);

    if (!consumedTemplateApprovals.has(key)) {
      issues.push(
        `Template approval was not used and is stale or points outside the compared suggestions surface: ${formatApprovedOperation(
          approval,
        )}`,
      );
    }
  }

  for (const approval of mappingManifest.approvedExtensions) {
    const key = operationKey(approval.path, approval.method);

    if (!consumedExtensionApprovals.has(key)) {
      issues.push(
        `Extension approval was not used and is stale or points outside the compared suggestions surface: ${formatApprovedOperation(
          approval,
        )}`,
      );
    }
  }

  return {
    units: sortComparisonUnits(units),
    issues,
  };
}

function validateTemplateApproval(
  approval: ApprovedTemplateExpansion,
  officialTemplate: OfficialTemplateOperationRecord,
  ourOperation: OperationRecord,
  issues: string[],
): void {
  assertEqual(
    issues,
    approval.officialPathTemplate,
    officialTemplate.path,
    approval,
    'officialPathTemplate',
  );
  assertEqual(
    issues,
    approval.officialRequestRef,
    officialTemplate.requestRef,
    approval,
    'officialRequestRef',
  );
  assertEqual(
    issues,
    approval.officialResponseRef,
    officialTemplate.responseRef,
    approval,
    'officialResponseRef',
  );
  assertEqual(issues, approval.ourRequestRef, ourOperation.requestRef, approval, 'ourRequestRef');
  assertEqual(issues, approval.ourResponseRef, ourOperation.responseRef, approval, 'ourResponseRef');
}

function validateExtensionApproval(
  approval: ApprovedExtension,
  ourOperation: OperationRecord,
  issues: string[],
): void {
  assertEqual(issues, approval.ourRequestRef, ourOperation.requestRef, approval, 'ourRequestRef');
  assertEqual(issues, approval.ourResponseRef, ourOperation.responseRef, approval, 'ourResponseRef');
}

function assertEqual(
  issues: string[],
  approvedValue: RefIdentity | string,
  actualValue: RefIdentity | string,
  approval: ApprovedTemplateExpansion | ApprovedExtension,
  field: string,
): void {
  if (approvedValue === actualValue) {
    return;
  }

  issues.push(
    `Approval mismatch for ${approval.method.toUpperCase()} ${approval.path}: ${field} approved=${formatNullable(
      approvedValue,
    )} actual=${formatNullable(actualValue)}`,
  );
}

function extractOfficialOperations(document: OpenAPIV3_1.Document): {
  concrete: Map<string, OperationRecord>;
  templates: OfficialTemplateOperationRecord[];
} {
  const concrete = new Map<string, OperationRecord>();
  const templates: OfficialTemplateOperationRecord[] = [];

  for (const [rawPath, pathItem] of Object.entries(document.paths ?? {})) {
    const path = normalizeOfficialPath(rawPath);

    for (const method of HTTP_METHODS) {
      const operation = pathItem?.[method];

      if (!operation) {
        continue;
      }

      const record: OperationRecord = {
        path,
        method,
        operation,
        requestRef: getRequestBodyJsonSchemaRef(operation.requestBody),
        responseRef: getResponseJsonSchemaRef(operation.responses, '200'),
      };

      if (path.includes('{')) {
        templates.push({
          ...record,
          prefix: getTemplatePrefix(path),
        });
      } else {
        concrete.set(operationKey(path, method), record);
      }
    }
  }

  return {
    concrete,
    templates: templates.sort(compareOperationRecords),
  };
}

function extractOurFamilyOperations(
  document: OpenAPIV3_1.Document,
  official: {
    concrete: Map<string, OperationRecord>;
    templates: OfficialTemplateOperationRecord[];
  },
): Map<string, OperationRecord> {
  const operations = new Map<string, OperationRecord>();
  const officialConcretePaths = new Set([...official.concrete.values()].map((operation) => operation.path));
  const templatePrefixes = official.templates.map((template) => template.prefix);

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (
      !officialConcretePaths.has(path) &&
      !templatePrefixes.some((prefix) => path.startsWith(prefix))
    ) {
      continue;
    }

    for (const method of HTTP_METHODS) {
      const operation = pathItem?.[method];

      if (!operation) {
        continue;
      }

      operations.set(operationKey(path, method), {
        path,
        method,
        operation,
        requestRef: getRequestBodyJsonSchemaRef(operation.requestBody),
        responseRef: getResponseJsonSchemaRef(operation.responses, '200'),
      });
    }
  }

  return operations;
}

function findMatchingTemplateOperations(
  templates: OfficialTemplateOperationRecord[],
  operation: OperationRecord,
): OfficialTemplateOperationRecord[] {
  return templates
    .filter((template) => template.method === operation.method)
    .filter((template) => operation.path.startsWith(template.prefix))
    .sort((left, right) => right.prefix.length - left.prefix.length || compareOperationRecords(left, right));
}

function getRequestBodyJsonSchemaRef(
  requestBody: OpenAPIV3_1.OperationObject['requestBody'],
): RefIdentity {
  if (!requestBody) {
    return null;
  }

  if ('$ref' in requestBody) {
    return requestBody.$ref;
  }

  return getSchemaRef(requestBody.content?.['application/json']?.schema);
}

function getResponseJsonSchemaRef(
  responses: OpenAPIV3_1.OperationObject['responses'],
  statusCode: string,
): RefIdentity {
  const response = responses?.[statusCode];

  if (!response) {
    return null;
  }

  if ('$ref' in response) {
    return response.$ref;
  }

  return getSchemaRef(response.content?.['application/json']?.schema);
}

function getSchemaRef(
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject | undefined,
): RefIdentity {
  if (!schema) {
    return null;
  }

  if ('$ref' in schema) {
    return schema.$ref;
  }

  return '<inline-schema>';
}

function parseManifest(source: string): SuggestionsMappingManifest {
  const parsed = YAML.parse(source) as unknown;

  if (!isRecord(parsed)) {
    throw new Error('Suggestions mapping manifest must be a YAML object.');
  }

  if (parsed.version !== 1) {
    throw new Error('Suggestions mapping manifest must have version: 1.');
  }

  if (parsed.family !== 'suggestions') {
    throw new Error('Suggestions mapping manifest must have family: suggestions.');
  }

  return {
    version: 1,
    family: 'suggestions',
    approvedTemplateExpansions: parseTemplateApprovals(parsed.approvedTemplateExpansions),
    approvedExtensions: parseExtensionApprovals(parsed.approvedExtensions),
  };
}

function parseTemplateApprovals(value: unknown): ApprovedTemplateExpansion[] {
  if (!Array.isArray(value)) {
    throw new Error('approvedTemplateExpansions must be an array.');
  }

  return value.map((item, index) => {
    const record = requireRecord(item, `approvedTemplateExpansions[${index}]`);

    return {
      path: requireString(record.path, `approvedTemplateExpansions[${index}].path`),
      method: requireHttpMethod(record.method, `approvedTemplateExpansions[${index}].method`),
      officialPathTemplate: requireString(
        record.officialPathTemplate,
        `approvedTemplateExpansions[${index}].officialPathTemplate`,
      ),
      officialRequestRef: requireNullableString(
        record.officialRequestRef,
        `approvedTemplateExpansions[${index}].officialRequestRef`,
      ),
      officialResponseRef: requireNullableString(
        record.officialResponseRef,
        `approvedTemplateExpansions[${index}].officialResponseRef`,
      ),
      ourRequestRef: requireNullableString(
        record.ourRequestRef,
        `approvedTemplateExpansions[${index}].ourRequestRef`,
      ),
      ourResponseRef: requireNullableString(
        record.ourResponseRef,
        `approvedTemplateExpansions[${index}].ourResponseRef`,
      ),
      reason: optionalString(record.reason, `approvedTemplateExpansions[${index}].reason`),
    };
  });
}

function parseExtensionApprovals(value: unknown): ApprovedExtension[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('approvedExtensions must be an array.');
  }

  return value.map((item, index) => {
    const record = requireRecord(item, `approvedExtensions[${index}]`);

    return {
      path: requireString(record.path, `approvedExtensions[${index}].path`),
      method: requireHttpMethod(record.method, `approvedExtensions[${index}].method`),
      ourRequestRef: requireNullableString(record.ourRequestRef, `approvedExtensions[${index}].ourRequestRef`),
      ourResponseRef: requireNullableString(
        record.ourResponseRef,
        `approvedExtensions[${index}].ourResponseRef`,
      ),
      reason: optionalString(record.reason, `approvedExtensions[${index}].reason`),
    };
  });
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

function optionalString(value: unknown, path: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireString(value, path);
}

function requireNullableString(value: unknown, path: string): RefIdentity {
  if (value === null) {
    return null;
  }

  return requireString(value, path);
}

function requireHttpMethod(value: unknown, path: string): HttpMethod {
  const method = requireString(value, path);

  if (!isHttpMethod(method)) {
    throw new Error(`${path} must be one of: ${HTTP_METHODS.join(', ')}.`);
  }

  return method;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isHttpMethod(value: string): value is HttpMethod {
  return HTTP_METHODS.includes(value as HttpMethod);
}

function indexManifestEntries<T extends { path: string; method: HttpMethod }>(
  entries: T[],
  sectionName: string,
  issues: string[],
): Map<string, T> {
  const result = new Map<string, T>();

  for (const entry of entries) {
    const key = operationKey(entry.path, entry.method);

    if (result.has(key)) {
      issues.push(`Duplicate ${sectionName} entry: ${entry.method.toUpperCase()} ${entry.path}`);
      continue;
    }

    result.set(key, entry);
  }

  return result;
}

function readManifestSource(manifestPath: string | null): string {
  if (manifestPath === STDIN_MANIFEST_PATH) {
    return readFileSync(0, 'utf8');
  }

  return readFileSync(resolve(manifestPath ?? DEFAULT_MANIFEST_PATH), 'utf8');
}

function normalizeOfficialPath(rawPath: string): string {
  if (!rawPath.startsWith(OFFICIAL_PATH_PREFIX)) {
    return rawPath;
  }

  const trimmed = rawPath.slice(OFFICIAL_PATH_PREFIX.length);
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function getTemplatePrefix(path: string): string {
  return path.split('{')[0] ?? path;
}

function operationKey(path: string, method: HttpMethod): string {
  return `${method}:${path}`;
}

function formatOperation(operation: OperationRecord): string {
  return `${operation.method.toUpperCase()} ${operation.path}`;
}

function formatApprovedOperation(operation: { path: string; method: HttpMethod }): string {
  return `${operation.method.toUpperCase()} ${operation.path}`;
}

function formatNullable(value: RefIdentity | string): string {
  return value ?? 'null';
}

function printReport(
  units: ComparisonUnit[],
  issues: string[],
  official: {
    concrete: Map<string, OperationRecord>;
    templates: OfficialTemplateOperationRecord[];
  },
  ours: Map<string, OperationRecord>,
  compareOptions: CompareOptions,
): void {
  const concreteUnits = units.filter((unit) => unit.kind === 'official-concrete');
  const templateUnits = units.filter((unit) => unit.kind === 'approved-template-expansion');
  const extensionUnits = units.filter((unit) => unit.kind === 'approved-extension');

  console.info('Official suggestions Stage A comparison report\n');
  console.info('Summary:');
  console.info(`- official concrete operations: ${official.concrete.size}`);
  console.info(`- official generic templates: ${official.templates.length}`);
  console.info(`- our compared operations: ${ours.size}`);
  console.info(`- comparison units: ${units.length}`);
  console.info(`- official-concrete units: ${concreteUnits.length}`);
  console.info(`- approved-template-expansion units: ${templateUnits.length}`);
  console.info(`- approved-extension units: ${extensionUnits.length}`);
  console.info(`- mismatches: ${issues.length}`);

  if (compareOptions.showAccepted && units.length > 0) {
    const acceptedUnits = units.filter((unit) => unit.kind !== 'official-concrete');

    console.info('\nAccepted mappings and extensions:');

    for (const unit of acceptedUnits) {
      console.info(`- [${unit.kind}] ${unit.method.toUpperCase()} ${unit.path}`);
      console.info(`  official source: ${unit.officialSourcePath ?? 'none'}`);
      console.info(`  official request: ${formatNullable(unit.officialRequestRef)}`);
      console.info(`  official response: ${formatNullable(unit.officialResponseRef)}`);
      console.info(`  our request: ${formatNullable(unit.ourRequestRef)}`);
      console.info(`  our response: ${formatNullable(unit.ourResponseRef)}`);
    }
  } else if (units.length > 0) {
    console.info('\nNotes:');
    console.info('- Run with `--show-accepted` to inspect manifest-backed mappings and extensions.');
  }

  if (issues.length > 0) {
    console.info('\nMismatches:');

    for (const issue of issues) {
      console.info(`- ${issue}`);
    }
  }
}

function sortOperationRecords(records: OperationRecord[]): OperationRecord[] {
  return [...records].sort(compareOperationRecords);
}

function sortComparisonUnits(units: ComparisonUnit[]): ComparisonUnit[] {
  return [...units].sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.method.localeCompare(right.method) ||
      left.kind.localeCompare(right.kind),
  );
}

function compareOperationRecords(left: OperationRecord, right: OperationRecord): number {
  return left.path.localeCompare(right.path) || left.method.localeCompare(right.method);
}

function parseOptions(args: string[]): CompareOptions {
  let manifestPath: string | null = null;
  let showAccepted = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--manifest') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Missing value for --manifest.');
      }

      manifestPath = value;
      index += 1;
      continue;
    }

    if (arg === '--show-accepted') {
      showAccepted = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    manifestPath,
    showAccepted,
  };
}
