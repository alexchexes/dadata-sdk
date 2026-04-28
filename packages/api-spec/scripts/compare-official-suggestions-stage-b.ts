// Stage B compares payload schemas after Stage A has produced a concrete official suggestions slice.
// This is still report-only: it normalizes comparison inputs, runs oasdiff, and prints grouped findings.
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';

import {
  COMPARISON_INFO,
  type ComparisonNormalizationDecision,
  normalizeComparisonDocument,
} from './official-comparison/comparison-normalization.js';
import { cloneJson, cloneOptionalJson, isRecord, parseJson, readJson, writeJson } from './official-comparison/io.js';
import { buildExactPathRegex, HTTP_METHODS, type HttpMethod, sortPaths } from './official-comparison/openapi.js';
import { printFailedCommand, runCommand } from './official-comparison/process.js';

interface CompareOptions {
  curationPath: string | null;
  keepTemp: boolean;
  maxGroups: number;
  maxSamples: number;
  oasdiffBin: string | null;
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

interface RevisionSliceResult {
  normalizationDecisions: ComparisonNormalizationDecision[];
  operationCount: number;
}

const OUR_SPEC_PATH = resolve('dadata.json');
const STAGE_A_SCRIPT_PATH = './scripts/compare-official-suggestions-stage-a.ts';
const DEFAULT_MAX_GROUPS = 8;
const DEFAULT_MAX_SAMPLES = 2;
const METADATA_SUMMARY_ELEMENTS = 'description,examples,extensions,summary,title';

const options = parseOptions(process.argv.slice(2));
const tempDir = mkdtempSync(join(tmpdir(), 'dadata-suggestions-stage-b-'));
const projectionPath = join(tempDir, 'official-suggestions.projected.json');
const projectionNormalizationDecisionsPath = join(tempDir, 'official-suggestions.normalization-decisions.json');
const revisionSlicePath = join(tempDir, 'ours-suggestions.comparable.json');
const revisionNormalizationDecisionsPath = join(tempDir, 'ours-suggestions.normalization-decisions.json');

try {
  const oasdiffBin = resolveOasdiffBin(options.oasdiffBin);

  runStageAProjection(projectionPath, options);

  const projectedSpec = readJson<OpenAPIV3_1.Document>(
    projectionPath,
    'projected official suggestions spec',
  );
  const ourSpec = readJson<OpenAPIV3_1.Document>(OUR_SPEC_PATH, 'our dadata.json');
  const comparisonOpenapiVersion = ourSpec.openapi ?? '3.1.1';

  const projectionNormalizationDecisions = normalizeComparisonDocument(
    projectedSpec,
    comparisonOpenapiVersion,
  );
  writeJson(projectionPath, projectedSpec);
  writeJson(projectionNormalizationDecisionsPath, projectionNormalizationDecisions);

  const comparableOperations = extractComparableOperations(projectedSpec);
  const revisionSlice = writeComparableRevisionSlice(
    comparableOperations,
    revisionSlicePath,
    ourSpec,
  );
  writeJson(revisionNormalizationDecisionsPath, revisionSlice.normalizationDecisions);
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
    projectionNormalizationDecisions,
    projectionNormalizationDecisionsPath,
    revisionNormalizationDecisionsPath,
    revisionSlice,
    revisionSlicePath,
    summary,
    tempDir,
  });
} finally {
  if (!options.keepTemp) {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

/** Runs Stage A and writes the projected official suggestions spec for this Stage B run. */
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

/** Runs oasdiff summary against the bounded comparable path set. */
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

/** Runs oasdiff breaking output; this is used for report grouping, not semantic truth. */
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

/** Extracts the projected path+method inventory that Stage B is allowed to compare. */
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

/** Builds our temporary spec slice with only operations present in the Stage A projection. */
function writeComparableRevisionSlice(
  comparableOperations: Map<string, Set<HttpMethod>>,
  outputPath: string,
  ourSpec: OpenAPIV3_1.Document,
): RevisionSliceResult {
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

  const normalizationDecisions = normalizeComparisonDocument(document, document.openapi ?? '3.1.1');
  writeJson(outputPath, document);

  return {
    normalizationDecisions,
    operationCount,
  };
}

/** Resolves the oasdiff binary from CLI/env/PATH/local experiment locations. */
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

/** Prints the Stage B report in a compact operator-facing shape. */
function printReport(report: {
  breakingFindings: OasdiffBreakingFinding[];
  matchPathRegex: string;
  oasdiffBin: string;
  options: CompareOptions;
  projectedPaths: string[];
  projectionPath: string;
  projectionNormalizationDecisions: ComparisonNormalizationDecision[];
  projectionNormalizationDecisionsPath: string;
  revisionNormalizationDecisionsPath: string;
  revisionSlice: RevisionSliceResult;
  revisionSlicePath: string;
  summary: OasdiffSummary;
  tempDir: string;
}): void {
  console.info('Official suggestions Stage B oasdiff prototype\n');
  console.info('Pipeline:');
  console.info('- Stage A projection: clean');
  console.info(`- projected comparable paths: ${report.projectedPaths.length}`);
  console.info(`- projected comparable operations: ${report.revisionSlice.operationCount}`);
  console.info(`- revision source: ${OUR_SPEC_PATH}`);
  console.info('- revision slice: derived from dadata.json with only projected path+method operations');
  console.info(
    `- comparison normalization: official ${report.projectionNormalizationDecisions.length}, ours ${report.revisionSlice.normalizationDecisions.length}`,
  );
  console.info(`- oasdiff binary: ${report.oasdiffBin}`);

  if (report.options.keepTemp) {
    console.info(`- temp dir: ${report.tempDir}`);
    console.info(`- projected official spec: ${report.projectionPath}`);
    console.info(`- projected official normalization decisions: ${report.projectionNormalizationDecisionsPath}`);
    console.info(`- comparable revision spec: ${report.revisionSlicePath}`);
    console.info(`- comparable revision normalization decisions: ${report.revisionNormalizationDecisionsPath}`);
  }

  printNormalizationDetails(
    report.projectionNormalizationDecisions,
    report.revisionSlice.normalizationDecisions,
  );

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

/** Summarizes comparison-only schema normalization decisions. */
function printNormalizationDetails(
  officialDecisions: ComparisonNormalizationDecision[],
  revisionDecisions: ComparisonNormalizationDecision[],
): void {
  const groups = new Map<string, number>();

  for (const decision of [...officialDecisions, ...revisionDecisions]) {
    groups.set(decision.kind, (groups.get(decision.kind) ?? 0) + 1);
  }

  if (groups.size === 0) {
    return;
  }

  console.info('\ncomparison normalization decisions:');

  for (const [kind, count] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    console.info(`- ${kind}: ${count}`);
  }
}

/** Prints oasdiff summary details with stable section ordering. */
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

/** Prints grouped finding samples according to CLI limits. */
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

/** Groups oasdiff breaking findings by caller-provided key. */
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

/** Formats the operation identity used in finding samples. */
function formatFindingOperation(finding: OasdiffBreakingFinding): string {
  const method = finding.operation ?? '<unknown-method>';
  const path = finding.path ?? '<unknown-path>';

  return `${method.toUpperCase()} ${path}`;
}

/** Formats one report sample line. */
function formatFindingSample(finding: OasdiffBreakingFinding): string {
  const severity = isErrorFinding(finding) ? 'ERR' : isWarningFinding(finding) ? 'WARN' : 'INFO';
  const id = finding.id ?? '<missing-id>';
  const operation = formatFindingOperation(finding);
  const text = formatFindingText(finding);

  return `[${severity}] ${operation}: ${id} - ${text}`;
}

/** Applies small display fixes to oasdiff finding text. */
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

/** Parses Stage B CLI options. */
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
