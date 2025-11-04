import { usePaths } from 'vitepress-openapi';

import spec from '../../../packages/api-spec/dadata.json' with { type: 'json' };

export default {
  paths() {
    return usePaths({ spec: spec as any })
      .getTags()
      .map(({ name }) => {
        return {
          params: {
            tag: name,
            pageTitle: `${name} - Dadata`,
          },
        };
      });
  },
};
