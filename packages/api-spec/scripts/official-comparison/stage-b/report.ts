import { isRecord } from '../io.js';
import type { ComparisonNormalizationDecision } from './comparison-normalization.js';
import type { ComponentPruningResult } from './component-pruning.js';
import type { DiffUnit, DiffUnitsByPath } from './diff-units.js';
import type {
  OasdiffBreakingFinding,
  OasdiffDiff,
  OasdiffSummary,
  SnapshotResult,
  StageBOptions,
  StageBReport,
} from './types.js';

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

interface OasdiffDiffSummary {
  changedPathCount: number;
  markerCounts: Record<string, number>;
  rootSections: string[];
}

/** Prints the shared Stage B operator report for one official family. */
export function printStageBReport(report: StageBReport): void {
  const { artifacts, config } = report;

  console.info(`Official ${config.family} Stage B oasdiff prototype\n`);
  console.info('Pipeline:');
  console.info('- Stage A projection: clean');
  console.info(`- projected comparable paths: ${report.projectedPaths.length}`);
  console.info(`- projected comparable operations: ${report.revisionSlice.operationCount}`);
  console.info(`- revision source: ${report.ourSpecPath}`);
  console.info(
    '- revision slice: derived from dadata.json with only projected path+method operations',
  );
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
    console.info(`- temp dir: ${artifacts.tempDir}`);
    console.info(`- projected official spec: ${artifacts.projectionPath}`);
    console.info(
      `- projected official normalized before pruning: ${artifacts.projectionNormalizedUnprunedPath}`,
    );
    console.info(
      `- projected official normalization decisions: ${artifacts.projectionNormalizationDecisionsPath}`,
    );
    console.info(
      `- projected official component pruning: ${artifacts.projectionComponentPruningPath}`,
    );
    console.info(`- comparable revision spec: ${artifacts.revisionSlicePath}`);
    console.info(
      `- comparable revision normalized before pruning: ${artifacts.revisionNormalizedUnprunedPath}`,
    );
    console.info(
      `- comparable revision normalization decisions: ${artifacts.revisionNormalizationDecisionsPath}`,
    );
    console.info(
      `- comparable revision component pruning: ${artifacts.revisionComponentPruningPath}`,
    );
    console.info(`- oasdiff full diff JSON: ${artifacts.fullDiffPath}`);
    console.info(`- Stage B diff units: ${artifacts.diffUnitsPath}`);
    console.info(`- Stage B diff units by path: ${artifacts.diffUnitsByPathPath}`);
    console.info(`- Stage B diff units snapshot: ${artifacts.diffUnitsSnapshotPath}`);
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
  printBreakingFindings(report.breakingFindings, report.options);

  console.info('\nNotes:');
  console.info('- Stage B snapshots verify the complete diff; accepted differences remain visible.');
  console.info(
    '- Stage A extensions are stripped from the temporary revision slice before oasdiff runs.',
  );
  console.info(
    '- Component pruning only removes unreferenced standard component entries from temporary specs.',
  );
  console.info(
    '- oasdiff renders null enum values as undefined; Stage B samples display those as null.',
  );
  console.info(
    `- oasdiff path filter: exact projected path set (${report.projectedPaths.length} paths).`,
  );

  if (report.options.keepTemp) {
    console.info(`- oasdiff path filter regex: ${report.matchPathRegex}`);
  }
}

function printFullDiffDetails(diff: OasdiffDiff): void {
  const summary = summarizeOasdiffDiff(diff);

  console.info('\noasdiff full diff:');
  console.info(
    `- root sections: ${summary.rootSections.length > 0 ? summary.rootSections.join(', ') : 'none'}`,
  );
  console.info(`- changed paths: ${summary.changedPathCount}`);
  console.info(`- raw markers: ${formatCounts(summary.markerCounts)}`);
}

function printDiffUnitDetails(
  units: DiffUnit[],
  unitsByPath: DiffUnitsByPath,
  options: StageBOptions,
): void {
  console.info('\nStage B diff units:');
  console.info(`- total: ${units.length}`);
  console.info(`- by kind: ${formatCounts(countDiffUnitsByKind(units))}`);

  printDiffUnitGroups(
    'Top diff unit kinds:',
    groupDiffUnits(units, (unit) => unit.kind),
    options,
  );
  printDiffUnitGroups(
    'Top operations by diff unit count:',
    countDiffUnitsByOperation(unitsByPath),
    options,
  );
}

function printBreakingFindings(findings: OasdiffBreakingFinding[], options: StageBOptions): void {
  const errors = findings.filter((finding) => isErrorFinding(finding)).length;
  const warnings = findings.filter((finding) => isWarningFinding(finding)).length;
  const other = findings.length - errors - warnings;

  console.info('\noasdiff breaking findings:');
  console.info(`- total: ${findings.length}`);
  console.info(`- errors: ${errors}`);
  console.info(`- warnings: ${warnings}`);

  if (other > 0) {
    console.info(`- other: ${other}`);
  }

  printFindingGroups(
    'Top finding ids:',
    groupFindings(findings, (finding) => finding.id ?? '<missing-id>'),
    options,
  );
  printFindingGroups(
    'Top paths by finding count:',
    groupFindings(findings, formatFindingOperation),
    options,
  );
}

function summarizeOasdiffDiff(diff: OasdiffDiff): OasdiffDiffSummary {
  const markerCounts: Record<string, number> = {};

  collectDiffMarkers(diff, markerCounts);

  return {
    changedPathCount: countChangedPaths(diff),
    markerCounts,
    rootSections: Object.keys(diff).sort((left, right) => left.localeCompare(right)),
  };
}

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

function isDiffMarkerKey(key: string): boolean {
  return (
    key === 'added' ||
    key === 'deleted' ||
    key === 'modified' ||
    key.endsWith('Added') ||
    key.endsWith('Deleted')
  );
}

function countMarkerValue(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (isRecord(value)) {
    return Object.keys(value).length;
  }

  return value === true ? 1 : 0;
}

function countCollectionItems(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (isRecord(value)) {
    return Object.keys(value).length;
  }

  return 0;
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(([left], [right]) => left.localeCompare(right));

  return entries.length === 0
    ? 'none'
    : entries.map(([key, count]) => `${key} ${count}`).join(', ');
}

function formatSnapshotResult(result: SnapshotResult): string {
  if (result.mode === 'none') {
    return `${result.message} (${result.path})`;
  }

  return `${result.mode} ${result.ok ? 'ok' : 'failed'}: ${result.message} (${result.path})`;
}

function countDiffUnitsByKind(units: DiffUnit[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const unit of units) {
    counts[unit.kind] = (counts[unit.kind] ?? 0) + 1;
  }

  return counts;
}

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

  return groups.sort(
    (left, right) => right.count - left.count || left.key.localeCompare(right.key),
  );
}

function printDiffUnitGroups(title: string, groups: DiffUnitGroup[], options: StageBOptions): void {
  if (groups.length === 0) {
    return;
  }

  console.info(`\n${title}`);

  for (const group of groups.slice(0, options.maxGroups)) {
    console.info(`- ${group.key}: ${group.count}`);

    for (const sample of group.samples.slice(0, options.maxSamples)) {
      console.info(`  sample: ${formatDiffUnitSample(sample)}`);
    }
  }
}

function groupDiffUnits(units: DiffUnit[], getKey: (unit: DiffUnit) => string): DiffUnitGroup[] {
  const groups = new Map<string, DiffUnitGroup>();

  for (const unit of units) {
    const key = getKey(unit);
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      existing.samples.push(unit);
    } else {
      groups.set(key, { key, count: 1, samples: [unit] });
    }
  }

  return [...groups.values()].sort(
    (left, right) => right.count - left.count || left.key.localeCompare(right.key),
  );
}

function formatDiffUnitSample(unit: DiffUnit): string {
  const status = unit.status ? ` ${unit.status}` : '';
  const mediaType = unit.mediaType ? ` ${unit.mediaType}` : '';
  const change = formatDiffUnitChange(unit);

  return `${unit.method} ${unit.path}${status}: ${unit.side}${mediaType} ${unit.location} ${unit.kind}${change}`;
}

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

function countRemovedComponents(result: ComponentPruningResult): number {
  return Object.values(result.removed).reduce((total, names) => total + names.length, 0);
}

function printComponentPruningDetails(
  officialPruning: ComponentPruningResult,
  revisionPruning: ComponentPruningResult,
): void {
  if (
    countRemovedComponents(officialPruning) === 0 &&
    countRemovedComponents(revisionPruning) === 0
  ) {
    return;
  }

  console.info('\ncomparison component pruning:');
  console.info(`- official: ${formatComponentPruningSummary(officialPruning)}`);
  console.info(`- ours: ${formatComponentPruningSummary(revisionPruning)}`);
  console.info(
    `- validated local refs: official ${officialPruning.validatedLocalRefCount}, ours ${revisionPruning.validatedLocalRefCount}`,
  );
}

function formatComponentPruningSummary(result: ComponentPruningResult): string {
  const sections = [...new Set([...Object.keys(result.before), ...Object.keys(result.after)])].sort(
    (left, right) => left.localeCompare(right),
  );

  return sections.length === 0
    ? 'no components'
    : sections
        .map(
          (section) => `${section} ${result.before[section] ?? 0}->${result.after[section] ?? 0}`,
        )
        .join(', ');
}

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

  for (const [kind, count] of [...groups.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    console.info(`- ${kind}: ${count}`);
  }
}

function printSummaryDetails(summary: OasdiffSummary): void {
  const details = summary.details ?? {};
  const preferredSections = [
    'endpoints',
    'paths',
    'responses',
    'schemas',
    'security',
    'securitySchemes',
  ];
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

function printFindingGroups(title: string, groups: FindingGroup[], options: StageBOptions): void {
  if (groups.length === 0) {
    return;
  }

  console.info(`\n${title}`);

  for (const group of groups.slice(0, options.maxGroups)) {
    const severityParts = [
      group.errors > 0 ? `${group.errors} errors` : null,
      group.warnings > 0 ? `${group.warnings} warnings` : null,
    ].filter((part): part is string => Boolean(part));

    console.info(
      `- ${group.key}: ${group.count}${severityParts.length > 0 ? ` (${severityParts.join(', ')})` : ''}`,
    );

    for (const sample of group.samples.slice(0, options.maxSamples)) {
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
  return `${(finding.operation ?? '<unknown-method>').toUpperCase()} ${finding.path ?? '<unknown-path>'}`;
}

function formatFindingSample(finding: OasdiffBreakingFinding): string {
  const severity = isErrorFinding(finding) ? 'ERR' : isWarningFinding(finding) ? 'WARN' : 'INFO';
  const id = finding.id ?? '<missing-id>';
  const text = formatFindingText(finding);

  return `[${severity}] ${formatFindingOperation(finding)}: ${id} - ${text}`;
}

function formatFindingText(finding: OasdiffBreakingFinding): string {
  const text = finding.text ?? '<missing text>';

  return finding.id?.includes('enum-value') ? text.replaceAll('`undefined`', '`null`') : text;
}

function isErrorFinding(finding: OasdiffBreakingFinding): boolean {
  return (finding.level ?? 0) >= 3;
}

function isWarningFinding(finding: OasdiffBreakingFinding): boolean {
  return finding.level === 2;
}
