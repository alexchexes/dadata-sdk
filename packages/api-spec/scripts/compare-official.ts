import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import YAML from 'yaml';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

interface OfficialSourceSpec {
  name: 'cleaner' | 'suggestions' | 'profile';
  pathPrefix: string;
  acceptedUndeclaredSecurity: OpenAPIV3_1.SecurityRequirementObject[];
  localPath: string;
}

interface OfficialOperationRecord {
  source: OfficialSourceSpec['name'];
  path: string;
  method: HttpMethod;
  operation: OpenAPIV3_1.OperationObject;
  genericSourcePath: string | null;
}

interface OperationMismatch {
  path: string;
  method: HttpMethod;
  source: OfficialSourceSpec['name'];
  issues: string[];
}

interface ComparedDifference {
  path: string;
  method: HttpMethod;
  source: OfficialSourceSpec['name'];
  field: string;
  official: string;
  ours: string;
}

type AcceptedMismatch = ComparedDifference;
type AppliedNormalization = ComparedDifference;

interface CompareOptions {
  showAccepted: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

const ACCEPTED_UNDECLARED_SECURITY_OVERRIDES: Record<string, OpenAPIV3_1.SecurityRequirementObject[]> = {
  '/version': [{ ApiKey: [] }, {}],
};

const OFFICIAL_SPECS: OfficialSourceSpec[] = [
  {
    name: 'suggestions',
    localPath: 'official/source/suggestions.yml',
    pathPrefix: '/api/4_1/rs',
    acceptedUndeclaredSecurity: [{ ApiKey: [] }],
  },
  {
    name: 'cleaner',
    localPath: 'official/source/cleaner.yml',
    pathPrefix: '/api/v1',
    acceptedUndeclaredSecurity: [{ ApiKey: [], SecretKey: [] }],
  },
  {
    name: 'profile',
    localPath: 'official/source/profile.yml',
    pathPrefix: '/api/v2',
    acceptedUndeclaredSecurity: [{ ApiKey: [], SecretKey: [] }],
  },
];

const officialDocuments = new Map<OfficialSourceSpec['name'], OpenAPIV3_1.Document>(
  OFFICIAL_SPECS.map((spec) => [
    spec.name,
    YAML.parse(readFileSync(resolve(spec.localPath), 'utf8')) as OpenAPIV3_1.Document,
  ]),
);

const ourSpec = JSON.parse(
  readFileSync(resolve('dadata.json'), 'utf8'),
) as OpenAPIV3_1.Document;

const options = parseOptions(process.argv.slice(2));
const appliedNormalizations: AppliedNormalization[] = [];
const acceptedMismatches: AcceptedMismatch[] = [];
const officialOperations = loadOfficialOperations();
const officialPaths = new Set(officialOperations.map((operation) => operation.path));
const ourPaths = new Set(Object.keys(ourSpec.paths ?? {}));

const officialOnlyPaths = sortStrings([...officialPaths].filter((path) => !ourPaths.has(path)));
const ourOnlyPaths = sortStrings([...ourPaths].filter((path) => !officialPaths.has(path)));

const mismatches: OperationMismatch[] = [];

for (const official of officialOperations) {
  const ourOperation = getOperation(ourSpec, official.path, official.method);
  const issues: string[] = [];

  if (!ourOperation) {
    issues.push('operation missing in our spec');
  } else {
    const officialRequestBody = fingerprintRequestBody(official.operation.requestBody, getOfficialDocument(official));
    const ourRequestBody = fingerprintRequestBody(ourOperation.requestBody, ourSpec);

    if (officialRequestBody !== ourRequestBody) {
      issues.push(`request body differs: official=${officialRequestBody} ours=${ourRequestBody}`);
    }

    const responseStatusComparison = compareResponseStatusCodes(
      official.operation.responses,
      ourOperation.responses,
    );

    if (responseStatusComparison.coveringMatches.length > 0) {
      for (const match of responseStatusComparison.coveringMatches) {
        appliedNormalizations.push({
          path: official.path,
          method: official.method,
          source: official.source,
          field: 'response status codes',
          official: match.official,
          ours: match.ours,
        });
      }
    }

    if (responseStatusComparison.missingInOurs.length > 0) {
      issues.push(
        `response status codes missing in ours: ${responseStatusComparison.missingInOurs.join(', ')}`,
      );
    }

    if (
      responseStatusComparison.missingInOurs.length === 0 &&
      responseStatusComparison.extraInOurs.length > 0
    ) {
      acceptedMismatches.push({
        path: official.path,
        method: official.method,
        source: official.source,
        field: 'response status codes',
        official: responseStatusComparison.officialCodes.join(', '),
        ours: responseStatusComparison.ourCodes.join(', '),
      });
    }

    const officialSecurity = getDeclaredSecurityRequirements(getOfficialDocument(official), official.operation);
    const ourSecurity = getDeclaredSecurityRequirements(ourSpec, ourOperation);

    if (!securityRequirementsEqual(ourSecurity, officialSecurity)) {
      if (isAcceptedSecurityMismatch(official, officialSecurity, ourSecurity)) {
        acceptedMismatches.push({
          path: official.path,
          method: official.method,
          source: official.source,
          field: 'security',
          official: formatSecurityRequirements(officialSecurity),
          ours: formatSecurityRequirements(ourSecurity),
        });
      } else {
        issues.push(
          `security differs: official ${formatSecurityRequirements(officialSecurity)} vs ours ${formatSecurityRequirements(ourSecurity)}`,
        );
      }
    }
  }

  if (issues.length > 0) {
    mismatches.push({
      path: official.path,
      method: official.method,
      source: official.source,
      issues,
    });
  }
}

printReport({
  officialOnlyPaths,
  ourOnlyPaths,
  mismatches,
  acceptedMismatches,
  appliedNormalizations,
  options,
});

function loadOfficialOperations(): OfficialOperationRecord[] {
  const concreteOperations: OfficialOperationRecord[] = [];
  const genericOperations: OfficialOperationRecord[] = [];

  for (const spec of OFFICIAL_SPECS) {
    const document = officialDocuments.get(spec.name);

    if (!document) {
      throw new Error(`Official document is not loaded: ${spec.name}`);
    }

    for (const [rawPath, pathItem] of Object.entries(document.paths ?? {})) {
      const normalizedPath = normalizeOfficialPath(spec, rawPath);
      const isGeneric = rawPath.includes('{');

      for (const method of HTTP_METHODS) {
        const operation = pathItem?.[method];

        if (!operation) {
          continue;
        }

        const record: OfficialOperationRecord = {
          source: spec.name,
          path: normalizedPath,
          method,
          operation,
          genericSourcePath: isGeneric ? normalizedPath : null,
        };

        if (isGeneric) {
          genericOperations.push(record);
        } else {
          concreteOperations.push(record);
        }
      }
    }
  }

  const concretePathSet = new Set(concreteOperations.map((record) => record.path));
  const expandedGenericOperations = expandGenericOfficialOperations(genericOperations, concretePathSet);

  return [...concreteOperations, ...expandedGenericOperations].sort(compareOperationRecords);
}

function getOfficialDocument(record: OfficialOperationRecord): OpenAPIV3_1.Document {
  const document = officialDocuments.get(record.source);

  if (!document) {
    throw new Error(`Unknown official source: ${record.source}`);
  }

  return document;
}

function expandGenericOfficialOperations(
  genericOperations: OfficialOperationRecord[],
  concreteOfficialPaths: Set<string>,
): OfficialOperationRecord[] {
  const expanded: OfficialOperationRecord[] = [];

  for (const genericOperation of genericOperations) {
    const prefix = genericOperation.path.split('{')[0];

    const matchingOurPaths = Object.keys(ourSpec.paths ?? {})
      .filter((path) => path.startsWith(prefix))
      .filter((path) => !concreteOfficialPaths.has(path));

    for (const path of matchingOurPaths) {
      appliedNormalizations.push({
        path,
        method: genericOperation.method,
        source: genericOperation.source,
        field: 'path template',
        official: genericOperation.genericSourcePath ?? genericOperation.path,
        ours: 'concrete paths',
      });


      expanded.push({
        ...genericOperation,
        path,
      });
    }
  }

  return expanded;
}

function normalizeOfficialPath(spec: OfficialSourceSpec, rawPath: string): string {
  if (!rawPath.startsWith(spec.pathPrefix)) {
    return rawPath;
  }

  const trimmed = rawPath.slice(spec.pathPrefix.length);
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function getOperation(
  document: OpenAPIV3_1.Document,
  path: string,
  method: HttpMethod,
): OpenAPIV3_1.OperationObject | undefined {
  return document.paths?.[path]?.[method];
}

function fingerprintRequestBody(
  requestBody: OpenAPIV3_1.OperationObject['requestBody'],
  document: OpenAPIV3_1.Document,
): string {
  if (!requestBody || '$ref' in requestBody) {
    return requestBody ? 'requestBody:$ref' : 'none';
  }

  const content = (requestBody.content ?? {}) as Record<string, OpenAPIV3_1.MediaTypeObject>;
  const mediaTypes = Object.entries(content)
    .map(([mediaType, media]) => `${mediaType}:${fingerprintSchema(media.schema, document)}`)
    .sort();

  return mediaTypes.length > 0 ? mediaTypes.join(', ') : 'present:no-content';
}

function compareResponseStatusCodes(
  officialResponses: OpenAPIV3_1.OperationObject['responses'],
  ourResponses: OpenAPIV3_1.OperationObject['responses'],
): {
  officialCodes: string[];
  ourCodes: string[];
  missingInOurs: string[];
  extraInOurs: string[];
  coveringMatches: Array<{ official: string; ours: string }>;
} {
  const officialCodes = extractResponseCodes(officialResponses);
  const ourCodes = extractResponseCodes(ourResponses);
  const missingInOurs: string[] = [];
  const coveringMatches: Array<{ official: string; ours: string }> = [];

  for (const code of officialCodes) {
    const coveringCode = findCoveringResponseCode(code, ourCodes);

    if (!coveringCode) {
      missingInOurs.push(code);
      continue;
    }

    if (coveringCode !== code) {
      coveringMatches.push({ official: code, ours: coveringCode });
    }
  }

  return {
    officialCodes,
    ourCodes,
    missingInOurs,
    extraInOurs: ourCodes.filter((code) => !isResponseCodeCovered(code, officialCodes)),
    coveringMatches,
  };
}

function extractResponseCodes(responses: OpenAPIV3_1.OperationObject['responses']): string[] {
  return Object.keys(responses ?? {}).sort();
}

function isResponseCodeCovered(code: string, availableCodes: string[]): boolean {
  return findCoveringResponseCode(code, availableCodes) !== undefined;
}

function findCoveringResponseCode(code: string, availableCodes: string[]): string | undefined {
  return availableCodes.find((candidate) => responseCodesOverlap(code, candidate));
}

function responseCodesOverlap(left: string, right: string): boolean {
  if (left === right) {
    return true;
  }

  const leftFamily = getResponseCodeFamily(left);
  const rightFamily = getResponseCodeFamily(right);

  if (leftFamily && rightFamily) {
    return leftFamily === rightFamily;
  }

  if (leftFamily) {
    return right.startsWith(leftFamily);
  }

  if (rightFamily) {
    return left.startsWith(rightFamily);
  }

  return false;
}

function getResponseCodeFamily(code: string): string | null {
  const match = /^(?<family>[1-5])XX$/u.exec(code);
  return match?.groups?.family ?? null;
}

function fingerprintSchema(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined,
  document: OpenAPIV3_1.Document,
  seenRefs = new Set<string>(),
): string {
  if (!schema) {
    return 'no-schema';
  }

  if ('$ref' in schema) {
    const resolved = resolveLocalRef(schema.$ref, document);

    if (!resolved) {
      return `ref:${schema.$ref}`;
    }

    if (seenRefs.has(schema.$ref)) {
      return `ref-cycle:${schema.$ref}`;
    }

    const nextSeen = new Set(seenRefs);
    nextSeen.add(schema.$ref);
    return fingerprintSchema(resolved, document, nextSeen);
  }

  if (schema.oneOf?.length) {
    return `oneOf(${schema.oneOf
      .map((entry: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject) =>
        fingerprintSchema(entry, document, seenRefs),
      )
      .join('|')})`;
  }

  if (schema.anyOf?.length) {
    return `anyOf(${schema.anyOf
      .map((entry: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject) =>
        fingerprintSchema(entry, document, seenRefs),
      )
      .join('|')})`;
  }

  if (schema.allOf?.length) {
    return `allOf(${schema.allOf
      .map((entry: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject) =>
        fingerprintSchema(entry, document, seenRefs),
      )
      .join('|')})`;
  }

  if (schema.type === 'array') {
    return `array<${fingerprintSchema(schema.items, document, seenRefs)}>`;
  }

  if (Array.isArray(schema.type)) {
    return `type:${schema.type.join('|')}`;
  }

  if (schema.type) {
    return `type:${schema.type}`;
  }

  return 'schema:complex';
}

function resolveLocalRef(
  ref: string,
  document: OpenAPIV3_1.Document,
): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined {
  if (!ref.startsWith('#/')) {
    return undefined;
  }

  let current: unknown = document;

  for (const segment of ref.slice(2).split('/')) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[decodeJsonPointer(segment)];
  }

  if (!current || typeof current !== 'object') {
    return undefined;
  }

  return current as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
}

function decodeJsonPointer(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function getDeclaredSecurityRequirements(
  document: OpenAPIV3_1.Document,
  operation: OpenAPIV3_1.OperationObject,
): OpenAPIV3_1.SecurityRequirementObject[] {
  return normalizeSecurityRequirements(operation.security ?? document.security ?? []);
}

function normalizeSecurityRequirements(
  requirements: OpenAPIV3_1.SecurityRequirementObject[],
): OpenAPIV3_1.SecurityRequirementObject[] {
  return requirements
    .map((requirement: OpenAPIV3_1.SecurityRequirementObject) =>
      Object.fromEntries(
        Object.entries(requirement)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([scheme, scopes]) => [scheme, [...scopes].sort()]),
      ) as OpenAPIV3_1.SecurityRequirementObject,
    )
    .sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
    );
}

function formatSecurityRequirements(
  requirements: OpenAPIV3_1.SecurityRequirementObject[],
): string {
  return JSON.stringify(normalizeSecurityRequirements(requirements));
}

function securityRequirementsEqual(
  left: OpenAPIV3_1.SecurityRequirementObject[],
  right: OpenAPIV3_1.SecurityRequirementObject[],
): boolean {
  return formatSecurityRequirements(left) === formatSecurityRequirements(right);
}

function isAcceptedSecurityMismatch(
  official: OfficialOperationRecord,
  officialSecurity: OpenAPIV3_1.SecurityRequirementObject[],
  ourSecurity: OpenAPIV3_1.SecurityRequirementObject[],
): boolean {
  if (officialSecurity.length > 0) {
    return false;
  }

  const acceptedUndeclaredSecurity = normalizeSecurityRequirements(
    ACCEPTED_UNDECLARED_SECURITY_OVERRIDES[official.path] ??
      OFFICIAL_SPECS.find((spec) => spec.name === official.source)?.acceptedUndeclaredSecurity ??
      [],
  );

  if (!securityRequirementsEqual(ourSecurity, acceptedUndeclaredSecurity)) {
    return false;
  }

  return true;
}

function printReport(report: {
  officialOnlyPaths: string[];
  ourOnlyPaths: string[];
  mismatches: OperationMismatch[];
  acceptedMismatches: AcceptedMismatch[];
  appliedNormalizations: AppliedNormalization[];
  options: CompareOptions;
}) {
  console.info('Official-vs-ours spec comparison report\n');

  console.info('Summary:');
  console.info(`- official-only paths: ${report.officialOnlyPaths.length}`);
  console.info(`- our-only paths: ${report.ourOnlyPaths.length}`);
  console.info(`- shared operation mismatches: ${report.mismatches.length}`);
  console.info(`- accepted mismatches: ${report.acceptedMismatches.length}`);
  console.info(`- applied normalizations: ${report.appliedNormalizations.length}`);

  if (report.officialOnlyPaths.length > 0) {
    console.info('\nPaths present in official, missing in ours:');
    for (const path of report.officialOnlyPaths) {
      console.info(`- ${path}`);
    }
  }

  if (report.ourOnlyPaths.length > 0) {
    console.info('\nPaths present in ours, missing in official:');
    for (const path of report.ourOnlyPaths) {
      console.info(`- ${path}`);
    }
  }

  if (report.mismatches.length > 0) {
    console.info('\nShared operation mismatches:');
    for (const mismatch of report.mismatches) {
      console.info(`- [${mismatch.source}] ${mismatch.method.toUpperCase()} ${mismatch.path}`);
      for (const issue of mismatch.issues) {
        console.info(`  - ${issue}`);
      }
    }
  }

  if (report.options.showAccepted && report.acceptedMismatches.length > 0) {
    console.info('\nAccepted mismatches:');
    for (const group of groupComparedDifferences(report.acceptedMismatches)) {
      console.info(`- [${group.source}]`);
      console.info(`  paths (${group.count}): ${formatGroupedPaths(group.samplePaths, group.count)}`);
      console.info(`  field: ${group.field}`);
      console.info(`  official: ${group.official}`);
      console.info(`  ours: ${group.ours}`);
    }
  }

  if (report.options.showAccepted && report.appliedNormalizations.length > 0) {
    console.info('\nApplied normalizations:');
    for (const group of groupComparedDifferences(report.appliedNormalizations)) {
      const normalization = describeAppliedNormalization(group);

      console.info(`- [${group.source}]`);
      console.info(`  paths (${group.count}): ${formatGroupedPaths(group.samplePaths, group.count)}`);
      console.info(`  normalization: ${normalization.label}`);
      console.info(`  official: ${group.official}`);
      console.info(`  ours: ${normalization.ours}`);
    }
  }

  if (
    !report.options.showAccepted &&
    (
      report.acceptedMismatches.length > 0 ||
      report.appliedNormalizations.length > 0
    )
  ) {
    console.info('\nNotes:');

    if (report.acceptedMismatches.length > 0) {
      console.info(
        `- ${report.acceptedMismatches.length} accepted mismatches are hidden in the default view.`,
      );
    }

    if (report.appliedNormalizations.length > 0) {
      console.info(
        `- ${report.appliedNormalizations.length} applied normalizations are hidden in the default view.`,
      );
    }

    console.info('- Run `pnpm compare:official -- --show-accepted` to inspect them.');
  }
}

function groupComparedDifferences(items: ComparedDifference[]): Array<{
  source: OfficialSourceSpec['name'];
  field: string;
  official: string;
  ours: string;
  count: number;
  samplePaths: string[];
}> {
  const groups = new Map<string, {
    source: OfficialSourceSpec['name'];
    field: string;
    official: string;
    ours: string;
    paths: string[];
  }>();

  for (const item of items) {
    const key = `${item.source}::${item.field}::${item.official}::${item.ours}`;
    const existing = groups.get(key);

    if (existing) {
      existing.paths.push(item.path);
    } else {
      groups.set(key, {
        source: item.source,
        field: item.field,
        official: item.official,
        ours: item.ours,
        paths: [item.path],
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      source: group.source,
      field: group.field,
      official: group.official,
      ours: group.ours,
      count: group.paths.length,
      samplePaths: [...new Set(group.paths)].sort((left, right) => left.localeCompare(right)).slice(0, 6),
    }))
    .sort(
      (left, right) =>
        left.source.localeCompare(right.source) ||
        left.field.localeCompare(right.field) ||
        left.official.localeCompare(right.official) ||
        left.ours.localeCompare(right.ours),
    );
}

function formatGroupedPaths(samplePaths: string[], count: number): string {
  const listed = samplePaths.join(', ');
  return count > samplePaths.length ? `${listed}, ...` : listed;
}

function describeAppliedNormalization(group: {
  field: string;
  ours: string;
  samplePaths: string[];
  count: number;
}): {
  label: string;
  ours: string;
} {
  if (group.field === 'path template') {
    return {
      label: 'generic path template expansion',
      ours: `concrete paths like ${formatGroupedPaths(group.samplePaths, group.count)}`,
    };
  }

  if (group.field === 'response status codes') {
    return {
      label: 'response status coverage',
      ours: group.ours,
    };
  }

  return {
    label: group.field,
    ours: group.ours,
  };
}

function compareOperationRecords(left: OfficialOperationRecord, right: OfficialOperationRecord): number {
  return (
    left.path.localeCompare(right.path) ||
    left.method.localeCompare(right.method) ||
    left.source.localeCompare(right.source)
  );
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function parseOptions(args: string[]): CompareOptions {
  return {
    showAccepted: args.includes('--show-accepted'),
  };
}
