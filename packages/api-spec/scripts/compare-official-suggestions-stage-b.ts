// Stage B compares payload schemas after Stage A has produced a concrete official suggestions slice.
// This is still report-only: it normalizes comparison inputs, runs oasdiff, and prints grouped findings.
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';

import {
  COMPARISON_INFO,
  type ComparisonNormalizationDecision,
  normalizeComparisonDocument,
} from './official-comparison/comparison-normalization.js';
import {
  type ComponentPruningResult,
  pruneUnreferencedComponents,
} from './official-comparison/component-pruning.js';
import {
  buildDiffUnits,
  buildDiffUnitsByPath,
  renderDiffUnitSnapshot,
  type DiffUnit,
  type DiffUnitsByPath,
} from './official-comparison/diff-units.js';
import {
  cloneJson,
  cloneOptionalJson,
  isRecord,
  parseJson,
  readJson,
  readText,
  writeJson,
  writeText,
} from './official-comparison/io.js';
import { buildExactPathRegex, HTTP_METHODS, type HttpMethod, sortPaths } from './official-comparison/openapi.js';
import { printFailedCommand, runCommand } from './official-comparison/process.js';

interface CompareOptions {
  checkSnapshot: boolean;
  curationPath: string | null;
  keepTemp: boolean;
  maxGroups: number;
  maxSamples: number;
  oasdiffBin: string | null;
  updateSnapshot: boolean;
}

interface OasdiffSummary {
  diff?: boolean;
  details?: Record<string, Record<string, number>>;
}

type OasdiffDiff = Record<string, unknown>;

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

interface DiffUnitGroup {
  key: string;
  count: number;
  samples: DiffUnit[];
}

interface RevisionSliceResult {
  normalizationDecisions: ComparisonNormalizationDecision[];
  operationCount: number;
}

interface OasdiffDiffSummary {
  changedPathCount: number;
  markerCounts: Record<string, number>;
  rootSections: string[];
}

interface SnapshotResult {
  message: string;
  mode: 'check' | 'none' | 'update';
  ok: boolean;
  path: string;
}

const OUR_SPEC_PATH = resolve('dadata.json');
const SNAPSHOT_PATH = resolve('official/snapshots/suggestions.diff.txt');
const STAGE_A_SCRIPT_PATH = './scripts/compare-official-suggestions-stage-a.ts';
const DEFAULT_MAX_GROUPS = 8;
const DEFAULT_MAX_SAMPLES = 2;
const METADATA_SUMMARY_ELEMENTS = 'description,examples,extensions,summary,title';

const options = parseOptions(process.argv.slice(2));
const tempDir = mkdtempSync(join(tmpdir(), 'dadata-suggestions-stage-b-'));
const projectionPath = join(tempDir, 'official-suggestions.projected.json');
const projectionNormalizedUnprunedPath = join(tempDir, 'official-suggestions.normalized.unpruned.json');
const projectionNormalizationDecisionsPath = join(tempDir, 'official-suggestions.normalization-decisions.json');
const projectionComponentPruningPath = join(tempDir, 'official-suggestions.component-pruning.json');
const revisionSlicePath = join(tempDir, 'ours-suggestions.comparable.json');
const revisionNormalizedUnprunedPath = join(tempDir, 'ours-suggestions.normalized.unpruned.json');
const revisionNormalizationDecisionsPath = join(tempDir, 'ours-suggestions.normalization-decisions.json');
const revisionComponentPruningPath = join(tempDir, 'ours-suggestions.component-pruning.json');
const fullDiffPath = join(tempDir, 'oasdiff-full-diff.json');
const diffUnitsPath = join(tempDir, 'stage-b-diff-units.json');
const diffUnitsByPathPath = join(tempDir, 'stage-b-diff-units.by-path.json');
const diffUnitsSnapshotPath = join(tempDir, 'stage-b-diff-units.snapshot.txt');

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
  writeJson(projectionNormalizedUnprunedPath, projectedSpec);
  const projectionComponentPruning = pruneUnreferencedComponents(projectedSpec);
  writeJson(projectionPath, projectedSpec);
  writeJson(projectionNormalizationDecisionsPath, projectionNormalizationDecisions);
  writeJson(projectionComponentPruningPath, projectionComponentPruning);

  const comparableOperations = extractComparableOperations(projectedSpec);
  const revisionSlice = writeComparableRevisionSlice(
    comparableOperations,
    revisionSlicePath,
    ourSpec,
  );
  const revisionSpec = readJson<OpenAPIV3_1.Document>(revisionSlicePath, 'comparable revision suggestions spec');
  writeJson(revisionNormalizedUnprunedPath, revisionSpec);
  const revisionComponentPruning = pruneUnreferencedComponents(revisionSpec);
  writeJson(revisionSlicePath, revisionSpec);
  writeJson(revisionNormalizationDecisionsPath, revisionSlice.normalizationDecisions);
  writeJson(revisionComponentPruningPath, revisionComponentPruning);
  const projectedPaths = [...comparableOperations.keys()].sort((left, right) => left.localeCompare(right));
  const matchPathRegex = buildExactPathRegex(projectedPaths);
  const summary = runOasdiffSummary(oasdiffBin, projectionPath, revisionSlicePath, matchPathRegex);
  const fullDiff = runOasdiffDiff(oasdiffBin, projectionPath, revisionSlicePath, matchPathRegex);
  writeJson(fullDiffPath, fullDiff);
  const diffUnits = buildDiffUnits(fullDiff);
  const diffUnitsByPath = buildDiffUnitsByPath(diffUnits);
  const diffUnitsSnapshot = renderDiffUnitSnapshot(diffUnits);
  writeJson(diffUnitsPath, diffUnits);
  writeJson(diffUnitsByPathPath, diffUnitsByPath);
  writeText(diffUnitsSnapshotPath, diffUnitsSnapshot);
  const snapshotResult = handleSnapshot(diffUnitsSnapshot, options);
  const breakingFindings = runOasdiffBreaking(oasdiffBin, projectionPath, revisionSlicePath, matchPathRegex);

  printReport({
    breakingFindings,
    diffUnits,
    diffUnitsByPath,
    diffUnitsByPathPath,
    diffUnitsPath,
    diffUnitsSnapshotPath,
    fullDiff,
    fullDiffPath,
    matchPathRegex,
    oasdiffBin,
    options,
    projectionComponentPruning,
    projectionComponentPruningPath,
    projectedPaths,
    projectionPath,
    projectionNormalizedUnprunedPath,
    projectionNormalizationDecisions,
    projectionNormalizationDecisionsPath,
    revisionComponentPruning,
    revisionComponentPruningPath,
    revisionNormalizationDecisionsPath,
    revisionNormalizedUnprunedPath,
    revisionSlice,
    revisionSlicePath,
    snapshotResult,
    summary,
    tempDir,
  });

  if (!snapshotResult.ok) {
    process.exit(1);
  }
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

/** Runs oasdiff full JSON diff; this is the intended raw input for future Stage B classification. */
function runOasdiffDiff(
  oasdiffBin: string,
  projectionPath: string,
  revisionPath: string,
  matchPathRegex: string,
): OasdiffDiff {
  const result = runCommand(oasdiffBin, [
    'diff',
    projectionPath,
    revisionPath,
    '-f',
    'json',
    '--match-path',
    matchPathRegex,
  ]);

  if (result.status !== 0) {
    printFailedCommand('oasdiff diff failed.', result);
    process.exit(1);
  }

  const parsed = parseJson<unknown>(result.stdout, 'oasdiff full diff JSON');

  if (!isRecord(parsed)) {
    throw new Error('oasdiff full diff JSON must be an object.');
  }

  return parsed;
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

/** Applies requested snapshot update/check behavior to the generated Stage B snapshot. */
function handleSnapshot(snapshotText: string, compareOptions: CompareOptions): SnapshotResult {
  if (compareOptions.updateSnapshot) {
    mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
    writeText(SNAPSHOT_PATH, snapshotText);

    return {
      message: 'updated',
      mode: 'update',
      ok: true,
      path: SNAPSHOT_PATH,
    };
  }

  if (!compareOptions.checkSnapshot) {
    return {
      message: 'not checked',
      mode: 'none',
      ok: true,
      path: SNAPSHOT_PATH,
    };
  }

  if (!existsSync(SNAPSHOT_PATH)) {
    return {
      message: 'missing snapshot; run with --update-snapshot to create it',
      mode: 'check',
      ok: false,
      path: SNAPSHOT_PATH,
    };
  }

  const expected = readText(SNAPSHOT_PATH);
  const ok = expected === snapshotText;

  return {
    message: ok ? 'matched' : 'mismatched; run with --update-snapshot if the new diff is accepted',
    mode: 'check',
    ok,
    path: SNAPSHOT_PATH,
  };
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
  diffUnits: DiffUnit[];
  diffUnitsByPath: DiffUnitsByPath;
  diffUnitsByPathPath: string;
  diffUnitsPath: string;
  diffUnitsSnapshotPath: string;
  fullDiff: OasdiffDiff;
  fullDiffPath: string;
  matchPathRegex: string;
  oasdiffBin: string;
  options: CompareOptions;
  projectionComponentPruning: ComponentPruningResult;
  projectionComponentPruningPath: string;
  projectedPaths: string[];
  projectionPath: string;
  projectionNormalizedUnprunedPath: string;
  projectionNormalizationDecisions: ComparisonNormalizationDecision[];
  projectionNormalizationDecisionsPath: string;
  revisionComponentPruning: ComponentPruningResult;
  revisionComponentPruningPath: string;
  revisionNormalizationDecisionsPath: string;
  revisionNormalizedUnprunedPath: string;
  revisionSlice: RevisionSliceResult;
  revisionSlicePath: string;
  snapshotResult: SnapshotResult;
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
  console.info(
    `- component pruning: official removed ${countRemovedComponents(report.projectionComponentPruning)}, ours removed ${countRemovedComponents(report.revisionComponentPruning)}`,
  );
  console.info(
    `- local ref validation: official ${report.projectionComponentPruning.validatedLocalRefCount}, ours ${report.revisionComponentPruning.validatedLocalRefCount}`,
  );
  console.info(`- accepted snapshot: ${formatSnapshotResult(report.snapshotResult)}`);
  console.info(`- oasdiff binary: ${report.oasdiffBin}`);

  if (report.options.keepTemp) {
    console.info(`- temp dir: ${report.tempDir}`);
    console.info(`- projected official spec: ${report.projectionPath}`);
    console.info(`- projected official normalized before pruning: ${report.projectionNormalizedUnprunedPath}`);
    console.info(`- projected official normalization decisions: ${report.projectionNormalizationDecisionsPath}`);
    console.info(`- projected official component pruning: ${report.projectionComponentPruningPath}`);
    console.info(`- comparable revision spec: ${report.revisionSlicePath}`);
    console.info(`- comparable revision normalized before pruning: ${report.revisionNormalizedUnprunedPath}`);
    console.info(`- comparable revision normalization decisions: ${report.revisionNormalizationDecisionsPath}`);
    console.info(`- comparable revision component pruning: ${report.revisionComponentPruningPath}`);
    console.info(`- oasdiff full diff JSON: ${report.fullDiffPath}`);
    console.info(`- Stage B diff units: ${report.diffUnitsPath}`);
    console.info(`- Stage B diff units by path: ${report.diffUnitsByPathPath}`);
    console.info(`- Stage B diff units snapshot: ${report.diffUnitsSnapshotPath}`);
  }

  printNormalizationDetails(
    report.projectionNormalizationDecisions,
    report.revisionSlice.normalizationDecisions,
  );
  printComponentPruningDetails(report.projectionComponentPruning, report.revisionComponentPruning);

  console.info('\noasdiff summary:');
  console.info(`- diff: ${report.summary.diff === true ? 'true' : 'false'}`);
  printSummaryDetails(report.summary);
  printFullDiffDetails(report.fullDiff);
  printDiffUnitDetails(report.diffUnits, report.diffUnitsByPath, report.options);

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
  console.info('- Component pruning only removes unreferenced standard component entries from temporary specs.');
  console.info('- oasdiff renders null enum values as undefined; Stage B samples display those as null.');
  console.info(`- oasdiff path filter: exact projected path set (${report.projectedPaths.length} paths).`);

  if (report.options.keepTemp) {
    console.info(`- oasdiff path filter regex: ${report.matchPathRegex}`);
  }
}

/** Prints a compact structural summary of the raw oasdiff full diff JSON. */
function printFullDiffDetails(diff: OasdiffDiff): void {
  const summary = summarizeOasdiffDiff(diff);

  console.info('\noasdiff full diff:');
  console.info(`- root sections: ${summary.rootSections.length > 0 ? summary.rootSections.join(', ') : 'none'}`);
  console.info(`- changed paths: ${summary.changedPathCount}`);
  console.info(`- raw markers: ${formatCounts(summary.markerCounts)}`);
}

/** Prints the first own report shape built from oasdiff full JSON. */
function printDiffUnitDetails(
  units: DiffUnit[],
  unitsByPath: DiffUnitsByPath,
  compareOptions: CompareOptions,
): void {
  console.info('\nStage B diff units:');
  console.info(`- total: ${units.length}`);
  console.info(`- by kind: ${formatCounts(countDiffUnitsByKind(units))}`);

  printDiffUnitGroups(
    'Top diff unit kinds:',
    groupDiffUnits(units, (unit) => unit.kind),
    compareOptions,
  );
  printDiffUnitGroups(
    'Top operations by diff unit count:',
    countDiffUnitsByOperation(unitsByPath),
    compareOptions,
  );
}

/** Summarizes raw oasdiff diff shape without interpreting semantic compatibility. */
function summarizeOasdiffDiff(diff: OasdiffDiff): OasdiffDiffSummary {
  const markerCounts: Record<string, number> = {};

  collectDiffMarkers(diff, markerCounts);

  return {
    changedPathCount: countChangedPaths(diff),
    markerCounts,
    rootSections: Object.keys(diff).sort((left, right) => left.localeCompare(right)),
  };
}

/** Counts common oasdiff structural marker keys recursively. */
function collectDiffMarkers(value: unknown, markerCounts: Record<string, number>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectDiffMarkers(item, markerCounts);
    }

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (isDiffMarkerKey(key)) {
      markerCounts[key] = (markerCounts[key] ?? 0) + countMarkerValue(child);
    }

    collectDiffMarkers(child, markerCounts);
  }
}

/** Counts path additions/deletions/modifications from the top-level paths diff. */
function countChangedPaths(diff: OasdiffDiff): number {
  const paths = diff.paths;

  if (!isRecord(paths)) {
    return 0;
  }

  return (
    countCollectionItems(paths.added) +
    countCollectionItems(paths.deleted) +
    countCollectionItems(paths.modified)
  );
}

/** Detects structural marker keys emitted by oasdiff full JSON. */
function isDiffMarkerKey(key: string): boolean {
  return key === 'added' || key === 'deleted' || key === 'modified' || key.endsWith('Added') || key.endsWith('Deleted');
}

/** Counts one marker value without interpreting what it represents. */
function countMarkerValue(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (isRecord(value)) {
    return Object.keys(value).length;
  }

  return value === true ? 1 : 0;
}

/** Counts array/object members used by oasdiff collection fields. */
function countCollectionItems(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (isRecord(value)) {
    return Object.keys(value).length;
  }

  return 0;
}

/** Formats count records with stable ordering. */
function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(([left], [right]) => left.localeCompare(right));

  if (entries.length === 0) {
    return 'none';
  }

  return entries.map(([key, count]) => `${key} ${count}`).join(', ');
}

/** Formats snapshot update/check status for the main report. */
function formatSnapshotResult(result: SnapshotResult): string {
  if (result.mode === 'none') {
    return `${result.message} (${result.path})`;
  }

  return `${result.mode} ${result.ok ? 'ok' : 'failed'}: ${result.message} (${result.path})`;
}

/** Counts diff units by kind. */
function countDiffUnitsByKind(units: DiffUnit[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const unit of units) {
    counts[unit.kind] = (counts[unit.kind] ?? 0) + 1;
  }

  return counts;
}

/** Counts grouped diff units by path-first operation identity. */
function countDiffUnitsByOperation(unitsByPath: DiffUnitsByPath): DiffUnitGroup[] {
  const groups: DiffUnitGroup[] = [];

  for (const [path, methods] of Object.entries(unitsByPath)) {
    for (const [method, operation] of Object.entries(methods)) {
      const samples = [
        ...operation.request,
        ...operation.responseStatuses,
        ...Object.values(operation.responses).flat(),
      ];

      groups.push({
        key: `${path} ${method.toUpperCase()}`,
        count: samples.length,
        samples,
      });
    }
  }

  return groups.sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

/** Prints grouped diff-unit samples according to CLI limits. */
function printDiffUnitGroups(title: string, groups: DiffUnitGroup[], compareOptions: CompareOptions): void {
  if (groups.length === 0) {
    return;
  }

  console.info(`\n${title}`);

  for (const group of groups.slice(0, compareOptions.maxGroups)) {
    console.info(`- ${group.key}: ${group.count}`);

    for (const sample of group.samples.slice(0, compareOptions.maxSamples)) {
      console.info(`  sample: ${formatDiffUnitSample(sample)}`);
    }
  }
}

/** Groups diff units by caller-provided key. */
function groupDiffUnits(units: DiffUnit[], getKey: (unit: DiffUnit) => string): DiffUnitGroup[] {
  const groups = new Map<string, DiffUnitGroup>();

  for (const unit of units) {
    const key = getKey(unit);
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      existing.samples.push(unit);
    } else {
      groups.set(key, {
        key,
        count: 1,
        samples: [unit],
      });
    }
  }

  return [...groups.values()].sort(
    (left, right) => right.count - left.count || left.key.localeCompare(right.key),
  );
}

/** Formats one own diff-unit sample line. */
function formatDiffUnitSample(unit: DiffUnit): string {
  const status = unit.status ? ` ${unit.status}` : '';
  const mediaType = unit.mediaType ? ` ${unit.mediaType}` : '';
  const change = formatDiffUnitChange(unit);

  return `${unit.method} ${unit.path}${status}: ${unit.side}${mediaType} ${unit.location} ${unit.kind}${change}`;
}

/** Formats changed values for one diff-unit sample. */
function formatDiffUnitChange(unit: DiffUnit): string {
  const parts = [
    unit.added !== undefined ? `added ${formatDiffUnitValue(unit.added)}` : null,
    unit.removed !== undefined ? `removed ${formatDiffUnitValue(unit.removed)}` : null,
    unit.from !== undefined || unit.to !== undefined
      ? `${formatDiffUnitValue(unit.from)} -> ${formatDiffUnitValue(unit.to)}`
      : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

/** Formats a value from the raw diff in a compact readable form. */
function formatDiffUnitValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(formatDiffUnitValue).join(', ')}]`;
  }

  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return '<missing>';
  }

  return typeof value === 'string' ? value || '""' : JSON.stringify(value);
}

/** Counts removed component entries across all component sections. */
function countRemovedComponents(result: ComponentPruningResult): number {
  return Object.values(result.removed).reduce((total, names) => total + names.length, 0);
}

/** Summarizes comparison-only component pruning without listing every retained schema. */
function printComponentPruningDetails(
  officialPruning: ComponentPruningResult,
  revisionPruning: ComponentPruningResult,
): void {
  if (countRemovedComponents(officialPruning) === 0 && countRemovedComponents(revisionPruning) === 0) {
    return;
  }

  console.info('\ncomparison component pruning:');
  console.info(`- official: ${formatComponentPruningSummary(officialPruning)}`);
  console.info(`- ours: ${formatComponentPruningSummary(revisionPruning)}`);
  console.info(
    `- validated local refs: official ${officialPruning.validatedLocalRefCount}, ours ${revisionPruning.validatedLocalRefCount}`,
  );
}

/** Formats before/after counts for component sections touched by pruning. */
function formatComponentPruningSummary(result: ComponentPruningResult): string {
  const sections = [...new Set([...Object.keys(result.before), ...Object.keys(result.after)])].sort((left, right) =>
    left.localeCompare(right),
  );

  if (sections.length === 0) {
    return 'no components';
  }

  return sections
    .map((section) => `${section} ${result.before[section] ?? 0}->${result.after[section] ?? 0}`)
    .join(', ');
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
  let checkSnapshot = false;
  let curationPath: string | null = null;
  let keepTemp = false;
  let maxGroups = DEFAULT_MAX_GROUPS;
  let maxSamples = DEFAULT_MAX_SAMPLES;
  let oasdiffBin: string | null = null;
  let updateSnapshot = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--check-snapshot') {
      checkSnapshot = true;
      continue;
    }

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

    if (arg === '--update-snapshot') {
      updateSnapshot = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (checkSnapshot && updateSnapshot) {
    throw new Error('--check-snapshot and --update-snapshot cannot be used together.');
  }

  return {
    checkSnapshot,
    curationPath,
    keepTemp,
    maxGroups,
    maxSamples,
    oasdiffBin,
    updateSnapshot,
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
