import { runStageAComparison } from './official-comparison/stage-a/index.js';

runStageAComparison({
  defaultCurationPath: 'official/curation/cleaner.yaml',
  family: 'cleaner',
  officialPathPrefix: '/api/v1',
  officialSourcePath: 'official/source/cleaner.yml',
  reportTitle: 'Official cleaner Stage A comparison report',
});
