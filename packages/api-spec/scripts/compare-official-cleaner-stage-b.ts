import { runStageBComparison } from './official-comparison/stage-b/index.js';

runStageBComparison({
  defaultCurationPath: 'official/curation/cleaner.yaml',
  family: 'cleaner',
  snapshotPath: 'official/snapshots/cleaner.diff.txt',
  stageAScriptPath: './scripts/compare-official-cleaner-stage-a.ts',
});
