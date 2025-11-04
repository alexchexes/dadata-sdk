import { highlightChunks } from './highlight-chunks';

export function highlightHtml(
  text: string,
  query: string,
  options: { tagName?: string; className?: string } = {},
): string {
  const { tagName = 'mark', className = '' } = options;

  return highlightChunks(text, query)
    .map((chunk) =>
      chunk.match ? `<${tagName} class="${className}">${chunk.text}</${tagName}>` : chunk.text,
    )
    .join('');
}
