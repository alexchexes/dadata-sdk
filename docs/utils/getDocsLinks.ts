import { OpenApi } from 'vitepress-openapi';

import spec from '../../packages/api-spec/dadata.json' with { type: 'json' };

const openApi = OpenApi({ spec: spec as any });
const paths = openApi.getPaths();

/**
 * Extracts from the `x-externalDocs` field on the Path Object level of a given Operation,
 * combines them with Operation Object `externalDocs` field, and returns result as array.
 */
export const getDocsLinks = (operation: Record<string, any>, path: string): string[] => {
  const links: string[] = [];

  if (operation.externalDocs) {
    links.push(operation.externalDocs.url);
  }

  if (paths[path]['x-externalDocs']) {
    (paths[path]['x-externalDocs'] as Record<'url', string>[])
      .filter((linkObj) => !links.includes(linkObj.url))
      .forEach((linkObj) => links.push(linkObj.url));
  }
  return links;
};
