import { matchWords } from './match-words';

export function highlightHtml(
  text: string,
  query: string,
  options: { tagName?: string; className?: string } = {},
): string {
  const { tagName = 'mark', className = '' } = options;

  return matchWords(text, query)
    .map((chunk) =>
      chunk.match ? `<${tagName} class="${className}">${chunk.text}</${tagName}>` : chunk.text,
    )
    .join('');
}
