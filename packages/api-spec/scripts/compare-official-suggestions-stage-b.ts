import { runStageBComparison } from './official-comparison/stage-b/index.js';

runStageBComparison({
  defaultCurationPath: 'official/curation/suggestions.yaml',
  family: 'suggestions',
  snapshotPath: 'official/snapshots/suggestions.diff.txt',
  stageAScriptPath: './scripts/compare-official-suggestions-stage-a.ts',
});
