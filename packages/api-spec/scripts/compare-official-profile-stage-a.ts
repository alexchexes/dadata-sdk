import { runStageAComparison } from './official-comparison/stage-a/index.js';

runStageAComparison({
  defaultCurationPath: 'official/curation/profile.yaml',
  family: 'profile',
  officialPathPrefix: '/api/v2',
  officialSourcePath: 'official/source/profile.yml',
  reportTitle: 'Official profile Stage A comparison report',
});
