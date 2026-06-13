import { runStageAComparison } from './official-comparison/stage-a/index.js';

runStageAComparison({
  defaultCurationPath: 'official/curation/suggestions.yaml',
  family: 'suggestions',
  officialPathPrefix: '/api/4_1/rs',
  officialSourcePath: 'official/source/suggestions.yml',
  reportTitle: 'Official suggestions Stage A comparison report',
});
