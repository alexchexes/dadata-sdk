import type { ComparisonNormalizationDecision } from './comparison-normalization.js';
import type { ComponentPruningResult } from './component-pruning.js';
import type { DiffUnit, DiffUnitsByPath } from './diff-units.js';

export interface StageBFamilyConfig {
  defaultCurationPath: string;
  family: string;
  snapshotPath: string;
  stageAScriptPath: string;
}

export interface StageBOptions {
  checkSnapshot: boolean;
  curationPath: string | null;
  keepTemp: boolean;
  maxGroups: number;
  maxSamples: number;
  oasdiffBin: string | null;
  updateSnapshot: boolean;
}

export interface OasdiffSummary {
  diff?: boolean;
  details?: Record<string, Record<string, number>>;
}

export type OasdiffDiff = Record<string, unknown>;

export interface OasdiffBreakingFinding {
  id?: string;
  text?: string;
  level?: number;
  operation?: string;
  operationId?: string;
  path?: string;
  section?: string;
  fingerprint?: string;
}

export interface RevisionSliceResult {
  normalizationDecisions: ComparisonNormalizationDecision[];
  operationCount: number;
}

export interface SnapshotResult {
  message: string;
  mode: 'check' | 'none' | 'update';
  ok: boolean;
  path: string;
}

export interface StageBArtifacts {
  diffUnitsByPathPath: string;
  diffUnitsPath: string;
  diffUnitsSnapshotPath: string;
  fullDiffPath: string;
  projectionComponentPruningPath: string;
  projectionNormalizationDecisionsPath: string;
  projectionNormalizedUnprunedPath: string;
  projectionPath: string;
  revisionComponentPruningPath: string;
  revisionNormalizationDecisionsPath: string;
  revisionNormalizedUnprunedPath: string;
  revisionSlicePath: string;
  tempDir: string;
}

export interface StageBReport {
  artifacts: StageBArtifacts;
  breakingFindings: OasdiffBreakingFinding[];
  config: StageBFamilyConfig;
  diffUnits: DiffUnit[];
  diffUnitsByPath: DiffUnitsByPath;
  fullDiff: OasdiffDiff;
  matchPathRegex: string;
  oasdiffBin: string;
  options: StageBOptions;
  ourSpecPath: string;
  projectedPaths: string[];
  projectionComponentPruning: ComponentPruningResult;
  projectionNormalizationDecisions: ComparisonNormalizationDecision[];
  revisionComponentPruning: ComponentPruningResult;
  revisionSlice: RevisionSliceResult;
  snapshotResult: SnapshotResult;
  summary: OasdiffSummary;
}
