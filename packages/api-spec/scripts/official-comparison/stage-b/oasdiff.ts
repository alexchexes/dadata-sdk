import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { isRecord, parseJson } from '../io.js';
import { printFailedCommand, runCommand } from '../process.js';
import type { OasdiffBreakingFinding, OasdiffDiff, OasdiffSummary } from './types.js';

const METADATA_SUMMARY_ELEMENTS = 'description,examples,extensions,summary,title';

/** Resolves the oasdiff binary from CLI/env/PATH/local experiment locations. */
export function resolveOasdiffBin(explicitPath: string | null): string {
  const envPath = process.env.OASDIFF_BIN;
  const localExperimentBin = resolve('../../tmp/oasdiff-experiment/bin/oasdiff.exe');
  const candidates = [explicitPath, envPath, 'oasdiff', localExperimentBin].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

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

/** Runs oasdiff summary against the bounded comparable path set. */
export function runOasdiffSummary(
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

/** Runs oasdiff full JSON diff, the semantic input for Stage B classification. */
export function runOasdiffDiff(
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

/** Runs oasdiff breaking output for operator-facing report grouping. */
export function runOasdiffBreaking(
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
