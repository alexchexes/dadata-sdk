import type markdownit from 'markdown-it';

/**
 * Adds target="_blank" and rel="noopener" to absolute http(s):// links
 */
export function linkTargetBlank(md: markdownit) {
  const target = '_blank';
  const rel = 'noopener noreferrer';
  const pattern = /^https?:\/\//i;

  // Keep any earlier rule so we don't clobber other plugins.
  const defaultRender =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const href = tokens[idx].attrGet('href');
    if (href && pattern.test(href)) {
      tokens[idx].attrSet('target', target);
      tokens[idx].attrSet('rel', rel);
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
