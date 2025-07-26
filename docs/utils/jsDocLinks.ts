import type markdownit from 'markdown-it';

export function jsDocLinks(md: markdownit) {
  // Put the core rule *after* "normalize" so we get already‑normalised text
  // but *before* "block" so the block‑parser sees our replacement markdown.
  md.core.ruler.after('normalize', 'jsdoc_links_to_md', (state) => {
    state.src = state.src
      // {@link https://foo.com | Foo}  or  {@link https://foo.com Foo}
      .replace(
        /(?<!\\)\{\s*@link\s+([^\s|}]+)(?:\s*[| ]\s*([^}]+))?\s*}/g,
        (_, url, label) => `[${label || url}](${url})`,
      )
      // @see https://foo.com
      .replace(/(?<!\\)@see\s+(https?:\/\/\S+)(?=[\s)]|$)/g, (_, url) => `See [${url}](${url})`);
  });
}
