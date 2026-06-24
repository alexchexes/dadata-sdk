import { join } from 'node:path';

import type { StageBArtifacts } from './types.js';

/** Builds the temporary artifact paths for one Stage B run. */
export function buildStageBArtifacts(tempDir: string, family: string): StageBArtifacts {
  return {
    diffUnitsByPathPath: join(tempDir, 'stage-b-diff-units.by-path.json'),
    diffUnitsPath: join(tempDir, 'stage-b-diff-units.json'),
    diffUnitsSnapshotPath: join(tempDir, 'stage-b-diff-units.snapshot.txt'),
    fullDiffPath: join(tempDir, 'oasdiff-full-diff.json'),
    projectionComponentPruningPath: join(tempDir, `official-${family}.component-pruning.json`),
    projectionNormalizationDecisionsPath: join(
      tempDir,
      `official-${family}.normalization-decisions.json`,
    ),
    projectionNormalizedUnprunedPath: join(tempDir, `official-${family}.normalized.unpruned.json`),
    projectionPath: join(tempDir, `official-${family}.projected.json`),
    revisionComponentPruningPath: join(tempDir, `ours-${family}.component-pruning.json`),
    revisionNormalizationDecisionsPath: join(
      tempDir,
      `ours-${family}.normalization-decisions.json`,
    ),
    revisionNormalizedUnprunedPath: join(tempDir, `ours-${family}.normalized.unpruned.json`),
    revisionSlicePath: join(tempDir, `ours-${family}.comparable.json`),
    tempDir,
  };
}
