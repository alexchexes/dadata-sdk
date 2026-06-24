import { runStageBComparison } from './official-comparison/stage-b/index.js';

runStageBComparison({
  defaultCurationPath: 'official/curation/profile.yaml',
  family: 'profile',
  snapshotPath: 'official/snapshots/profile.diff.txt',
  stageAScriptPath: './scripts/compare-official-profile-stage-a.ts',
});
