import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';

import {
  COMPARISON_INFO,
  normalizeComparisonDocument,
} from './official-comparison/comparison-normalization.js';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

interface CompareOptions {
  curationPath: string | null;
  keepTemp: boolean;
  maxGroups: number;
  maxSamples: number;
  oasdiffBin: string | null;
}

interface CommandResult {
  command: string;
  args: string[];
  status: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

interface OasdiffSummary {
  diff?: boolean;
  details?: Record<string, Record<string, number>>;
}

interface OasdiffBreakingFinding {
  id?: string;
  text?: string;
  level?: number;
  operation?: string;
  operationId?: string;
  path?: string;
  section?: string;
  fingerprint?: string;
}

interface FindingGroup {
  key: string;
  count: number;
  errors: number;
  warnings: number;
  samples: OasdiffBreakingFinding[];
}

const HTTP_METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const OUR_SPEC_PATH = resolve('dadata.json');
const STAGE_A_SCRIPT_PATH = './scripts/compare-official-suggestions-stage-a.ts';
const DEFAULT_MAX_GROUPS = 8;
const DEFAULT_MAX_SAMPLES = 2;
const METADATA_SUMMARY_ELEMENTS = 'description,examples,extensions,summary,title';

const options = parseOptions(process.argv.slice(2));
const tempDir = mkdtempSync(join(tmpdir(), 'dadata-suggestions-stage-b-'));
const projectionPath = join(tempDir, 'official-suggestions.projected.json');
const revisionSlicePath = join(tempDir, 'ours-suggestions.comparable.json');

try {
  const oasdiffBin = resolveOasdiffBin(options.oasdiffBin);

  runStageAProjection(projectionPath, options);

  const projectedSpec = parseJson<OpenAPIV3_1.Document>(
    readFileSync(projectionPath, 'utf8'),
    'projected official suggestions spec',
  );
  const ourSpec = parseJson<OpenAPIV3_1.Document>(readFileSync(OUR_SPEC_PATH, 'utf8'), 'our dadata.json');
  const comparisonOpenapiVersion = ourSpec.openapi ?? '3.1.1';

  normalizeComparisonDocument(projectedSpec, comparisonOpenapiVersion);
  writeJson(projectionPath, projectedSpec);

  const comparableOperations = extractComparableOperations(projectedSpec);
  const revisionOperationCount = writeComparableRevisionSlice(
    comparableOperations,
    revisionSlicePath,
    ourSpec,
  );
  const projectedPaths = [...comparableOperations.keys()].sort((left, right) => left.localeCompare(right));
  const matchPathRegex = buildExactPathRegex(projectedPaths);
  const summary = runOasdiffSummary(oasdiffBin, projectionPath, revisionSlicePath, matchPathRegex);
  const breakingFindings = runOasdiffBreaking(oasdiffBin, projectionPath, revisionSlicePath, matchPathRegex);

  printReport({
    breakingFindings,
    matchPathRegex,
    oasdiffBin,
    options,
    projectedPaths,
    projectionPath,
    revisionOperationCount,
    revisionSlicePath,
    summary,
    tempDir,
  });
} finally {
  if (!options.keepTemp) {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

function runStageAProjection(projectionPath: string, compareOptions: CompareOptions): void {
  const args = [
    'exec',
    'tsx',
    STAGE_A_SCRIPT_PATH,
    '--write-projection',
    projectionPath,
  ];

  if (compareOptions.curationPath) {
    args.push('--curation', compareOptions.curationPath);
  }

  const result = runCommand('pnpm', args, {
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    printFailedCommand('Stage A projection failed.', result);
    process.exit(1);
  }
}

function runOasdiffSummary(
  oasdiffBin: string,
  projectionPath: string,
  revisionPath: string,
  matchPathRegex: string,
): OasdiffSummary {
  const result = runCommand(oasdiffBin, [
    'summary',
    projectionPath,
    revisionPath,
    '-f',
    'json',
    '--match-path',
    matchPathRegex,
    '--exclude-elements',
    METADATA_SUMMARY_ELEMENTS,
  ]);

  if (result.status !== 0) {
    printFailedCommand('oasdiff summary failed.', result);
    process.exit(1);
  }

  return parseJson<OasdiffSummary>(result.stdout, 'oasdiff summary JSON');
}

function runOasdiffBreaking(
  oasdiffBin: string,
  projectionPath: string,
  revisionPath: string,
  matchPathRegex: string,
): OasdiffBreakingFinding[] {
  const result = runCommand(oasdiffBin, [
    'breaking',
    projectionPath,
    revisionPath,
    '-f',
    'json',
    '--match-path',
    matchPathRegex,
  ]);

  if (result.status !== 0) {
    printFailedCommand('oasdiff breaking failed.', result);
    process.exit(1);
  }

  const parsed = parseJson<unknown>(result.stdout, 'oasdiff breaking JSON');

  if (!Array.isArray(parsed)) {
    throw new Error('oasdiff breaking JSON must be an array.');
  }

  return parsed.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`oasdiff breaking JSON item ${index} must be an object.`);
    }

    return item as OasdiffBreakingFinding;
  });
}

function extractComparableOperations(document: OpenAPIV3_1.Document): Map<string, Set<HttpMethod>> {
  const operations = new Map<string, Set<HttpMethod>>();

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    const methods = new Set<HttpMethod>();

    for (const method of HTTP_METHODS) {
      if (pathItem?.[method]) {
        methods.add(method);
      }
    }

    if (methods.size > 0) {
      operations.set(path, methods);
    }
  }

  if (operations.size === 0) {
    throw new Error('Projected official suggestions spec has no comparable operations.');
  }

  return operations;
}

function writeComparableRevisionSlice(
  comparableOperations: Map<string, Set<HttpMethod>>,
  outputPath: string,
  ourSpec: OpenAPIV3_1.Document,
): number {
  const paths: OpenAPIV3_1.PathsObject = {};
  let operationCount = 0;

  for (const [path, methods] of comparableOperations) {
    const sourcePathItem = ourSpec.paths?.[path];

    if (!sourcePathItem) {
      throw new Error(`Our spec is missing comparable Stage A path: ${path}.`);
    }

    const comparablePathItem: OpenAPIV3_1.PathItemObject = {};

    if (sourcePathItem.parameters) {
      comparablePathItem.parameters = cloneJson(sourcePathItem.parameters);
    }

    for (const method of methods) {
      const operation = sourcePathItem[method];

      if (!operation) {
        throw new Error(`Our spec is missing comparable Stage A operation: ${method.toUpperCase()} ${path}.`);
      }

      comparablePathItem[method] = cloneJson(operation);
      operationCount += 1;
    }

    paths[path] = comparablePathItem;
  }

  const document: OpenAPIV3_1.Document = {
    openapi: ourSpec.openapi ?? '3.1.1',
    info: cloneJson(COMPARISON_INFO),
    servers: cloneOptionalJson(ourSpec.servers),
    security: cloneOptionalJson(ourSpec.security),
    tags: cloneOptionalJson(ourSpec.tags),
    paths: sortPaths(paths),
    components: cloneOptionalJson(ourSpec.components),
  };

  normalizeComparisonDocument(document, document.openapi ?? '3.1.1');
  writeJson(outputPath, document);

  return operationCount;
}

function resolveOasdiffBin(explicitPath: string | null): string {
  const envPath = process.env.OASDIFF_BIN;
  const localExperimentBin = resolve('../../tmp/oasdiff-experiment/bin/oasdiff.exe');
  const candidates = [
    explicitPath,
    envPath,
    'oasdiff',
    localExperimentBin,
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (candidate !== 'oasdiff' && !existsSync(candidate)) {
      continue;
    }

    const result = runCommand(candidate, ['--version']);

    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error(
    'oasdiff was not found. Install it on PATH, set OASDIFF_BIN, or pass --oasdiff-bin <path>.',
  );
}

function runCommand(
  command: string,
  args: string[],
  options: {
    shell?: boolean;
  } = {},
): CommandResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: options.shell ?? false,
  });

  return {
    command,
    args,
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error,
  };
}

function parseJson<T>(source: string, label: string): T {
  try {
    return JSON.parse(source) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Failed to parse ${label}: ${message}`);
  }
}

function buildExactPathRegex(paths: string[]): string {
  if (paths.length === 0) {
    throw new Error('Projected official suggestions spec has no paths.');
  }

  return `^(${paths.map(escapeRegex).join('|')})$`;
}

function escapeRegex(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneOptionalJson<T>(value: T | undefined): T | undefined {
  return value === undefined ? undefined : cloneJson(value);
}

function sortPaths(paths: OpenAPIV3_1.PathsObject): OpenAPIV3_1.PathsObject {
  const sorted: OpenAPIV3_1.PathsObject = {};

  for (const path of Object.keys(paths).sort((left, right) => left.localeCompare(right))) {
    sorted[path] = paths[path];
  }

  return sorted;
}

function printReport(report: {
  breakingFindings: OasdiffBreakingFinding[];
  matchPathRegex: string;
  oasdiffBin: string;
  options: CompareOptions;
  projectedPaths: string[];
  projectionPath: string;
  revisionOperationCount: number;
  revisionSlicePath: string;
  summary: OasdiffSummary;
  tempDir: string;
}): void {
  console.info('Official suggestions Stage B oasdiff prototype\n');
  console.info('Pipeline:');
  console.info('- Stage A projection: clean');
  console.info(`- projected comparable paths: ${report.projectedPaths.length}`);
  console.info(`- projected comparable operations: ${report.revisionOperationCount}`);
  console.info(`- revision source: ${OUR_SPEC_PATH}`);
  console.info('- revision slice: derived from dadata.json with only projected path+method operations');
  console.info(`- oasdiff binary: ${report.oasdiffBin}`);

  if (report.options.keepTemp) {
    console.info(`- temp dir: ${report.tempDir}`);
    console.info(`- projected official spec: ${report.projectionPath}`);
    console.info(`- comparable revision spec: ${report.revisionSlicePath}`);
  }

  console.info('\noasdiff summary:');
  console.info(`- diff: ${report.summary.diff === true ? 'true' : 'false'}`);
  printSummaryDetails(report.summary);

  const errors = report.breakingFindings.filter((finding) => isErrorFinding(finding)).length;
  const warnings = report.breakingFindings.filter((finding) => isWarningFinding(finding)).length;
  const other = report.breakingFindings.length - errors - warnings;

  console.info('\noasdiff breaking findings:');
  console.info(`- total: ${report.breakingFindings.length}`);
  console.info(`- errors: ${errors}`);
  console.info(`- warnings: ${warnings}`);

  if (other > 0) {
    console.info(`- other: ${other}`);
  }

  printGroups(
    'Top finding ids:',
    groupFindings(report.breakingFindings, (finding) => finding.id ?? '<missing-id>'),
    report.options,
  );
  printGroups(
    'Top paths by finding count:',
    groupFindings(report.breakingFindings, formatFindingOperation),
    report.options,
  );

  console.info('\nNotes:');
  console.info('- Stage B is report-only for now; no accepted-difference baseline is applied yet.');
  console.info('- Stage A extensions are stripped from the temporary revision slice before oasdiff runs.');
  console.info('- oasdiff renders null enum values as undefined; Stage B samples display those as null.');
  console.info(`- oasdiff path filter: exact projected path set (${report.projectedPaths.length} paths).`);

  if (report.options.keepTemp) {
    console.info(`- oasdiff path filter regex: ${report.matchPathRegex}`);
  }
}

function printSummaryDetails(summary: OasdiffSummary): void {
  const details = summary.details ?? {};
  const preferredSections = ['endpoints', 'paths', 'responses', 'schemas', 'security', 'securitySchemes'];
  const sections = [
    ...preferredSections.filter((section) => details[section]),
    ...Object.keys(details)
      .filter((section) => !preferredSections.includes(section))
      .sort((left, right) => left.localeCompare(right)),
  ];

  for (const section of sections) {
    const counts = details[section] ?? {};
    const formatted = Object.entries(counts)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, count]) => `${name} ${count}`)
      .join(', ');

    console.info(`- ${section}: ${formatted || 'no changes'}`);
  }
}

function printGroups(title: string, groups: FindingGroup[], compareOptions: CompareOptions): void {
  if (groups.length === 0) {
    return;
  }

  console.info(`\n${title}`);

  for (const group of groups.slice(0, compareOptions.maxGroups)) {
    const severityParts = [
      group.errors > 0 ? `${group.errors} errors` : null,
      group.warnings > 0 ? `${group.warnings} warnings` : null,
    ].filter((part): part is string => Boolean(part));

    console.info(
      `- ${group.key}: ${group.count}${severityParts.length > 0 ? ` (${severityParts.join(', ')})` : ''}`,
    );

    for (const sample of group.samples.slice(0, compareOptions.maxSamples)) {
      console.info(`  sample: ${formatFindingSample(sample)}`);
    }
  }
}

function groupFindings(
  findings: OasdiffBreakingFinding[],
  getKey: (finding: OasdiffBreakingFinding) => string,
): FindingGroup[] {
  const groups = new Map<string, FindingGroup>();

  for (const finding of findings) {
    const key = getKey(finding);
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      existing.errors += isErrorFinding(finding) ? 1 : 0;
      existing.warnings += isWarningFinding(finding) ? 1 : 0;
      existing.samples.push(finding);
    } else {
      groups.set(key, {
        key,
        count: 1,
        errors: isErrorFinding(finding) ? 1 : 0,
        warnings: isWarningFinding(finding) ? 1 : 0,
        samples: [finding],
      });
    }
  }

  return [...groups.values()].sort(
    (left, right) => right.count - left.count || left.key.localeCompare(right.key),
  );
}

function formatFindingOperation(finding: OasdiffBreakingFinding): string {
  const method = finding.operation ?? '<unknown-method>';
  const path = finding.path ?? '<unknown-path>';

  return `${method.toUpperCase()} ${path}`;
}

function formatFindingSample(finding: OasdiffBreakingFinding): string {
  const severity = isErrorFinding(finding) ? 'ERR' : isWarningFinding(finding) ? 'WARN' : 'INFO';
  const id = finding.id ?? '<missing-id>';
  const operation = formatFindingOperation(finding);
  const text = formatFindingText(finding);

  return `[${severity}] ${operation}: ${id} - ${text}`;
}

function formatFindingText(finding: OasdiffBreakingFinding): string {
  const text = finding.text ?? '<missing text>';

  if (!finding.id?.includes('enum-value')) {
    return text;
  }

  return text.replaceAll('`undefined`', '`null`');
}

function isErrorFinding(finding: OasdiffBreakingFinding): boolean {
  return (finding.level ?? 0) >= 3;
}

function isWarningFinding(finding: OasdiffBreakingFinding): boolean {
  return finding.level === 2;
}

function printFailedCommand(message: string, result: CommandResult): void {
  console.error(message);
  console.error(`command: ${result.command} ${result.args.join(' ')}`);

  if (result.error) {
    console.error(`error: ${result.error.message}`);
  }

  if (result.stdout.trim()) {
    console.error('\nstdout:');
    console.error(result.stdout.trim());
  }

  if (result.stderr.trim()) {
    console.error('\nstderr:');
    console.error(result.stderr.trim());
  }
}

function parseOptions(args: string[]): CompareOptions {
  let curationPath: string | null = null;
  let keepTemp = false;
  let maxGroups = DEFAULT_MAX_GROUPS;
  let maxSamples = DEFAULT_MAX_SAMPLES;
  let oasdiffBin: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--curation') {
      curationPath = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--keep-temp') {
      keepTemp = true;
      continue;
    }

    if (arg === '--max-groups') {
      maxGroups = parsePositiveInteger(requireOptionValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === '--max-samples') {
      maxSamples = parsePositiveInteger(requireOptionValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === '--oasdiff-bin') {
      oasdiffBin = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    curationPath,
    keepTemp,
    maxGroups,
    maxSamples,
    oasdiffBin,
  };
}

function requireOptionValue(args: string[], index: number, optionName: string): string {
  const value = args[index + 1];

  if (!value) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return value;
}

function parsePositiveInteger(value: string, optionName: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${optionName} must be a positive integer.`);
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
