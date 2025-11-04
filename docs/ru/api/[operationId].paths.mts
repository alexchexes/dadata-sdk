import { usePaths } from 'vitepress-openapi';

import spec from '../../../packages/api-spec/dadata.json' with { type: 'json' };

export default {
  paths() {
    return usePaths({ spec: spec as any })
      .getPathsByVerbs()
      .map((path) => {
        return {
          params: {
            operationId: path?.operationId,
            pageTitle: `${path?.summary} - Dadata`,
          },
        };
      });
  },
};
