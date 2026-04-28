// Stage A validates the suggestions operation inventory against curated mappings.
// On a clean run it can also project official generic templates onto concrete paths for Stage B.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import YAML from 'yaml';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
type ComparisonUnitKind = 'official-concrete' | 'template-expansion' | 'extension';
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

interface OperationIdentity {
  path: string;
  method: HttpMethod;
}

interface OfficialTemplateIdentity {
  pathTemplate: string;
  method: HttpMethod;
}

interface TemplateExpansionMapping {
  our: OperationIdentity;
  official: OfficialTemplateIdentity;
}

interface ExtensionMapping {
  our: OperationIdentity;
}

interface OperationCuration {
  templateExpansions: TemplateExpansionMapping[];
  extensions: ExtensionMapping[];
}

interface SuggestionsCuration {
  version: 1;
  family: 'suggestions';
  operations: OperationCuration;
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
  curationPath: string | null;
  showCuration: boolean;
  writeProjectionPath: string | null;
}

interface ProjectionResult {
  document: OpenAPIV3_1.Document;
  projectedOperationCount: number;
  projectedPathCount: number;
  concreteOperationCount: number;
  templateExpandedOperationCount: number;
  excludedExtensionCount: number;
}

const HTTP_METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const OFFICIAL_PATH_PREFIX = '/api/4_1/rs';
const DEFAULT_CURATION_PATH = 'official/curation/suggestions.yaml';
const STDIN_CURATION_PATH = '-';
const INVOCATION_CWD = process.env.INIT_CWD ?? process.cwd();

const options = parseOptions(process.argv.slice(2));
const officialSpec = YAML.parse(
  readFileSync(resolve('official/source/suggestions.yml'), 'utf8'),
) as OpenAPIV3_1.Document;
const ourSpec = JSON.parse(readFileSync(resolve('dadata.json'), 'utf8')) as OpenAPIV3_1.Document;
const curation = parseCuration(readCurationSource(options.curationPath));

const officialOperations = extractOfficialOperations(officialSpec);
const ourFamilyOperations = extractOurFamilyOperations(ourSpec, officialOperations);
const comparison = compareSuggestionsStageA(officialOperations, ourFamilyOperations, curation);

printReport(comparison.units, comparison.issues, officialOperations, ourFamilyOperations, options);

if (comparison.issues.length > 0) {
  process.exitCode = 1;
} else if (options.writeProjectionPath) {
  const projection = buildProjectedOfficialSuggestionsSpec(comparison.units, officialOperations, officialSpec);
  const outputPath = resolveOutputPath(options.writeProjectionPath);

  writeJson(outputPath, projection.document);
  printProjectionReport(projection, outputPath);
}

/** Builds and validates the Stage A suggestions operation comparison units. */
function compareSuggestionsStageA(
  official: {
    concrete: Map<string, OperationRecord>;
    templates: OfficialTemplateOperationRecord[];
  },
  ours: Map<string, OperationRecord>,
  curation: SuggestionsCuration,
): {
  units: ComparisonUnit[];
  issues: string[];
} {
  const units: ComparisonUnit[] = [];
  const issues: string[] = [];
  const consumedTemplateMappings = new Set<string>();
  const consumedExtensionMappings = new Set<string>();
  const templateMappings = indexOperationMappings(
    curation.operations.templateExpansions,
    'operations.templateExpansions',
    issues,
  );
  const extensionMappings = indexOperationMappings(
    curation.operations.extensions,
    'operations.extensions',
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
      if (templateMappings.has(operationKeyValue)) {
        issues.push(
          `Template expansion mapping is stale because official now declares a concrete operation: ${formatOperation(
            ourOperation,
          )}`,
        );
      }

      if (extensionMappings.has(operationKeyValue)) {
        issues.push(
          `Extension mapping is stale because official now declares a concrete operation: ${formatOperation(
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
      const mapping = templateMappings.get(operationKeyValue);

      if (!mapping) {
        issues.push(
          `Generic-derived operation is missing from operations.templateExpansions: ${formatOperation(
            ourOperation,
          )} (candidate official template ${matchingTemplate.path})`,
        );
        continue;
      }

      consumedTemplateMappings.add(operationKeyValue);
      validateTemplateExpansionMapping(mapping, matchingTemplate, issues);
      units.push({
        path: ourOperation.path,
        method: ourOperation.method,
        kind: 'template-expansion',
        officialSourcePath: matchingTemplate.path,
        officialRequestRef: matchingTemplate.requestRef,
        officialResponseRef: matchingTemplate.responseRef,
        ourRequestRef: ourOperation.requestRef,
        ourResponseRef: ourOperation.responseRef,
      });
      continue;
    }

    const extensionMapping = extensionMappings.get(operationKeyValue);

    if (!extensionMapping) {
      issues.push(
        `Our operation has no official concrete or template analogue and is missing from operations.extensions: ${formatOperation(
          ourOperation,
        )}`,
      );
      continue;
    }

    consumedExtensionMappings.add(operationKeyValue);
    units.push({
      path: ourOperation.path,
      method: ourOperation.method,
      kind: 'extension',
      officialSourcePath: null,
      officialRequestRef: null,
      officialResponseRef: null,
      ourRequestRef: ourOperation.requestRef,
      ourResponseRef: ourOperation.responseRef,
    });
  }

  for (const mapping of curation.operations.templateExpansions) {
    const key = operationKey(mapping.our.path, mapping.our.method);

    if (!consumedTemplateMappings.has(key)) {
      issues.push(
        `Template expansion mapping was not used and is stale or points outside the compared suggestions surface: ${formatOperationIdentity(
          mapping.our,
        )}`,
      );
    }
  }

  for (const mapping of curation.operations.extensions) {
    const key = operationKey(mapping.our.path, mapping.our.method);

    if (!consumedExtensionMappings.has(key)) {
      issues.push(
        `Extension mapping was not used and is stale or points outside the compared suggestions surface: ${formatOperationIdentity(
          mapping.our,
        )}`,
      );
    }
  }

  return {
    units: sortComparisonUnits(units),
    issues,
  };
}

/** Validates one curated generic-template expansion against official and our operations. */
function validateTemplateExpansionMapping(
  mapping: TemplateExpansionMapping,
  officialTemplate: OfficialTemplateOperationRecord,
  issues: string[],
): void {
  if (mapping.official.pathTemplate !== officialTemplate.path) {
    issues.push(
      `Template expansion mapping mismatch for ${formatOperationIdentity(
        mapping.our,
      )}: official.pathTemplate=${mapping.official.pathTemplate} actual=${officialTemplate.path}`,
    );
  }

  if (mapping.official.method !== officialTemplate.method) {
    issues.push(
      `Template expansion mapping mismatch for ${formatOperationIdentity(
        mapping.our,
      )}: official.method=${mapping.official.method} actual=${officialTemplate.method}`,
    );
  }
}

/** Extracts concrete and generic-template operations from the official suggestions spec. */
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

/** Extracts our operations that belong to the comparable suggestions family. */
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

/** Writes the clean Stage A operation set as a projected official spec for payload diffing. */
function buildProjectedOfficialSuggestionsSpec(
  units: ComparisonUnit[],
  official: {
    concrete: Map<string, OperationRecord>;
    templates: OfficialTemplateOperationRecord[];
  },
  sourceDocument: OpenAPIV3_1.Document,
): ProjectionResult {
  const projectedPaths: OpenAPIV3_1.PathsObject = {};
  let concreteOperationCount = 0;
  let templateExpandedOperationCount = 0;
  let excludedExtensionCount = 0;

  for (const unit of sortComparisonUnits(units)) {
    if (unit.kind === 'extension') {
      excludedExtensionCount += 1;
      continue;
    }

    const sourceOperation = getProjectionSourceOperation(unit, official);
    const projectedOperation =
      unit.kind === 'template-expansion'
        ? normalizeTemplateExpandedOperation(sourceOperation.operation, unit)
        : cloneJson(sourceOperation.operation);
    const pathItem = projectedPaths[unit.path] ?? {};

    assignOperation(pathItem, unit.method, projectedOperation);
    projectedPaths[unit.path] = pathItem;

    if (unit.kind === 'template-expansion') {
      templateExpandedOperationCount += 1;
    } else {
      concreteOperationCount += 1;
    }
  }

  const document: OpenAPIV3_1.Document = {
    openapi: sourceDocument.openapi,
    info: {
      ...(cloneJson(sourceDocument.info) ?? {}),
      title: `${sourceDocument.info?.title ?? 'Official suggestions API'} (projected suggestions slice)`,
    },
    servers: cloneJson(sourceDocument.servers),
    paths: sortPaths(projectedPaths),
    components: cloneJson(sourceDocument.components),
  };

  return {
    document,
    projectedOperationCount: concreteOperationCount + templateExpandedOperationCount,
    projectedPathCount: Object.keys(projectedPaths).length,
    concreteOperationCount,
    templateExpandedOperationCount,
    excludedExtensionCount,
  };
}

/** Resolves the official operation used as source for one projected Stage A unit. */
function getProjectionSourceOperation(
  unit: ComparisonUnit,
  official: {
    concrete: Map<string, OperationRecord>;
    templates: OfficialTemplateOperationRecord[];
  },
): OperationRecord {
  if (!unit.officialSourcePath) {
    throw new Error(`Projection source is missing for ${unit.method.toUpperCase()} ${unit.path}.`);
  }

  if (unit.kind === 'official-concrete') {
    const concreteOperation = official.concrete.get(operationKey(unit.officialSourcePath, unit.method));

    if (!concreteOperation) {
      throw new Error(
        `Concrete projection source was not found: ${unit.method.toUpperCase()} ${unit.officialSourcePath}.`,
      );
    }

    return concreteOperation;
  }

  const templateOperation = official.templates.find(
    (template) => template.path === unit.officialSourcePath && template.method === unit.method,
  );

  if (!templateOperation) {
    throw new Error(
      `Template projection source was not found: ${unit.method.toUpperCase()} ${unit.officialSourcePath}.`,
    );
  }

  return templateOperation;
}

/** Removes stale template parameters and gives expanded operations unique operationIds. */
function normalizeTemplateExpandedOperation(
  operation: OpenAPIV3_1.OperationObject,
  unit: ComparisonUnit,
): OpenAPIV3_1.OperationObject {
  const projectedOperation = cloneJson(operation);

  if (projectedOperation.parameters) {
    const parameters = projectedOperation.parameters.filter((parameter) => {
      if ('$ref' in parameter) {
        return true;
      }

      return parameter.in !== 'path' || unit.path.includes(`{${parameter.name}}`);
    });

    if (parameters.length > 0) {
      projectedOperation.parameters = parameters;
    } else {
      delete projectedOperation.parameters;
    }
  }

  if (projectedOperation.operationId) {
    projectedOperation.operationId = `${projectedOperation.operationId}__projected__${slugifyPath(
      unit.path,
    )}`;
  }

  return projectedOperation;
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

/** Parses and validates the suggestions curation YAML shape. */
function parseCuration(source: string): SuggestionsCuration {
  const parsed = YAML.parse(source) as unknown;

  if (!isRecord(parsed)) {
    throw new Error('Suggestions curation must be a YAML object.');
  }

  if (parsed.version !== 1) {
    throw new Error('Suggestions curation must have version: 1.');
  }

  if (parsed.family !== 'suggestions') {
    throw new Error('Suggestions curation must have family: suggestions.');
  }

  const operations = requireRecord(parsed.operations, 'operations');

  return {
    version: 1,
    family: 'suggestions',
    operations: {
      templateExpansions: parseTemplateExpansionMappings(operations.templateExpansions),
      extensions: parseExtensionMappings(operations.extensions),
    },
  };
}

function parseTemplateExpansionMappings(value: unknown): TemplateExpansionMapping[] {
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

/** Indexes curated operations by our path+method and rejects duplicates. */
function indexOperationMappings<T extends { our: OperationIdentity }>(
  entries: T[],
  sectionName: string,
  issues: string[],
): Map<string, T> {
  const result = new Map<string, T>();

  for (const entry of entries) {
    const key = operationKey(entry.our.path, entry.our.method);

    if (result.has(key)) {
      issues.push(`Duplicate ${sectionName} entry: ${formatOperationIdentity(entry.our)}`);
      continue;
    }

    result.set(key, entry);
  }

  return result;
}

function readCurationSource(curationPath: string | null): string {
  if (curationPath === STDIN_CURATION_PATH) {
    return readFileSync(0, 'utf8');
  }

  return readFileSync(resolve(curationPath ?? DEFAULT_CURATION_PATH), 'utf8');
}

function resolveOutputPath(path: string): string {
  return resolve(INVOCATION_CWD, path);
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

function formatOperationIdentity(operation: OperationIdentity): string {
  return `${operation.method.toUpperCase()} ${operation.path}`;
}

function formatNullable(value: RefIdentity | string): string {
  return value ?? 'null';
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortPaths(paths: OpenAPIV3_1.PathsObject): OpenAPIV3_1.PathsObject {
  const sorted: OpenAPIV3_1.PathsObject = {};

  for (const path of Object.keys(paths).sort((left, right) => left.localeCompare(right))) {
    sorted[path] = paths[path];
  }

  return sorted;
}

function assignOperation(
  pathItem: OpenAPIV3_1.PathItemObject,
  method: HttpMethod,
  operation: OpenAPIV3_1.OperationObject,
): void {
  pathItem[method] = operation;
}

function slugifyPath(path: string): string {
  return path
    .replace(/^\//u, '')
    .replace(/[^a-zA-Z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '');
}

/** Prints the Stage A inventory/mapping report. */
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
  const templateUnits = units.filter((unit) => unit.kind === 'template-expansion');
  const extensionUnits = units.filter((unit) => unit.kind === 'extension');

  console.info('Official suggestions Stage A comparison report\n');
  console.info('Summary:');
  console.info(`- official concrete operations: ${official.concrete.size}`);
  console.info(`- official generic templates: ${official.templates.length}`);
  console.info(`- our compared operations: ${ours.size}`);
  console.info(`- comparison units: ${units.length}`);
  console.info(`- official-concrete units: ${concreteUnits.length}`);
  console.info(`- template-expansion units: ${templateUnits.length}`);
  console.info(`- extension units: ${extensionUnits.length}`);
  console.info(`- mismatches: ${issues.length}`);

  if (compareOptions.showCuration && units.length > 0) {
    const curatedUnits = units.filter((unit) => unit.kind !== 'official-concrete');

    console.info('\nCurated mappings and extensions:');

    for (const unit of curatedUnits) {
      console.info(`- [${unit.kind}] ${unit.method.toUpperCase()} ${unit.path}`);
      console.info(`  official source: ${unit.officialSourcePath ?? 'none'}`);
      console.info(`  official request: ${formatNullable(unit.officialRequestRef)}`);
      console.info(`  official response: ${formatNullable(unit.officialResponseRef)}`);
      console.info(`  our request: ${formatNullable(unit.ourRequestRef)}`);
      console.info(`  our response: ${formatNullable(unit.ourResponseRef)}`);
    }
  } else if (units.length > 0) {
    console.info('\nNotes:');
    console.info('- Run with `--show-curation` to inspect curated mappings and extensions.');
  }

  if (issues.length > 0) {
    console.info('\nMismatches:');

    for (const issue of issues) {
      console.info(`- ${issue}`);
    }
  }
}

function printProjectionReport(projection: ProjectionResult, outputPath: string): void {
  console.info('\nProjection written:');
  console.info(`- output: ${outputPath}`);
  console.info(`- projected paths: ${projection.projectedPathCount}`);
  console.info(`- projected operations: ${projection.projectedOperationCount}`);
  console.info(`- concrete operations copied: ${projection.concreteOperationCount}`);
  console.info(`- template-expanded operations copied: ${projection.templateExpandedOperationCount}`);
  console.info(`- extensions excluded: ${projection.excludedExtensionCount}`);
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

/** Parses Stage A CLI options. */
function parseOptions(args: string[]): CompareOptions {
  let curationPath: string | null = null;
  let showCuration = false;
  let writeProjectionPath: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--curation') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Missing value for --curation.');
      }

      curationPath = value;
      index += 1;
      continue;
    }

    if (arg === '--write-projection') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Missing value for --write-projection.');
      }

      writeProjectionPath = value;
      index += 1;
      continue;
    }

    if (arg === '--show-curation') {
      showCuration = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    curationPath,
    showCuration,
    writeProjectionPath,
  };
}
