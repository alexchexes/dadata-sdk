import type { OpenAPIV3_1 } from '@scalar/openapi-types';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export const HTTP_METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

/** Returns paths sorted by their literal OpenAPI path. */
export function sortPaths(paths: OpenAPIV3_1.PathsObject): OpenAPIV3_1.PathsObject {
  const sorted: OpenAPIV3_1.PathsObject = {};

  for (const path of Object.keys(paths).sort((left, right) => left.localeCompare(right))) {
    sorted[path] = paths[path];
  }

  return sorted;
}

/** Builds an exact-match regex for an already curated path set. */
export function buildExactPathRegex(paths: string[]): string {
  if (paths.length === 0) {
    throw new Error('Projected official suggestions spec has no paths.');
  }

  return `^(${paths.map(escapeRegex).join('|')})$`;
}

/** Escapes a literal string for use inside a regular expression. */
export function escapeRegex(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}
