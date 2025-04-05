type Chunk = {
  text: string;
  match: boolean;
};

/**
 * Returns an array of chunks:
 * [
 *   { text: "...", match: true|false },
 *   ...
 * ]
 *
 * Features:
 *   - Case-insensitive matching
 *   - 'е' <-> 'ё' equivalence (two-way)
 *   - Splits query by whitespace/punctuation
 *   - OR logic across tokens (any token match => highlight)
 *   - Merges overlapping matches to produce continuous highlight chunks
 */
export function matchWords(text: string, query: string): Chunk[] {
  // Quick fallback if either is empty
  if (!text || !text.trim()) {
    return [{ text, match: false }];
  }
  if (!query || !query.trim()) {
    return [{ text, match: false }];
  }

  // 1) Normalize text so 'ё' and 'е' are treated equally + lowercased
  //    We'll use this only for searching, not for the final displayed chunk text
  const textNormalized = normalize(text);

  // 2) Split query into tokens, also normalized
  const tokens = tokenizeQuery(query);

  // 3) Collect [start, end] intervals for all token matches in normalized text
  const intervals = findAllMatches(textNormalized, tokens);

  // 4) If no intervals found, return the whole text as one chunk
  if (intervals.length === 0) {
    return [{ text, match: false }];
  }

  // 5) Merge overlapping intervals
  const merged = mergeIntervals(intervals);

  // 6) Build final chunks from merged intervals
  return buildChunks(text, merged);
}

/** Lowercase & unify ё→е */
function normalize(str: string) {
  return (
    str
      .toLowerCase()
      // Replace every 'ё' with 'е' to unify them
      .replace(/[ё]/g, 'е')
  );
}

/**
 * Split a query into tokens on punctuation/whitespace,
 * then further split each token where it transitions from digit→letter or letter→digit.
 */
function tokenizeQuery(query: string): string[] {
  const WORD_DELIMITERS = '\\s"\'~\\*\\.,:\\|\\[\\]\\(\\)\\{\\}<>№';
  const WORD_PARTS_DELIMITERS = '\\-\\+\\\\\\?!@#$%^&';
  const SPLIT_REGEX = new RegExp(`[${WORD_DELIMITERS + WORD_PARTS_DELIMITERS}]+`, 'g');

  // First, convert ё→е and lowercase
  const normalized = normalize(query);

  // Split on punctuation/spaces
  const rawTokens = normalized.split(SPLIT_REGEX).filter(Boolean);

  // For each raw token (e.g. "90а"), further split by letter↔digit changes
  const subTokens: string[] = [];
  for (const rawToken of rawTokens) {
    subTokens.push(...splitDigitLetterSegments(rawToken));
  }

  // Remove duplicates
  const unique = [...new Set(subTokens)];

  return unique;
}

/**
 * Given a string like "90а" or "дом52а", break it into sub-tokens
 * when we switch between digit and letter. Examples:
 *   "90а"     -> ["90", "а"]
 *   "дом52а"  -> ["дом", "52", "а"]
 *   "83"      -> ["83"]
 *   "abc"     -> ["abc"]
 */
function splitDigitLetterSegments(token: string): string[] {
  if (!token) return [];

  const segments: string[] = [];
  let current = token[0];

  for (let i = 1; i < token.length; i++) {
    const ch = token[i];
    if (isDigit(ch) !== isDigit(current.slice(-1))) {
      // We have a transition letter→digit or digit→letter, so start a new segment
      segments.push(current);
      current = ch;
    } else {
      // Same type (both digit or both letter), keep appending
      current += ch;
    }
  }

  // Push whatever remains
  segments.push(current);

  return segments;
}

/**
 * For each token, find all substring occurrences. If the token is very short
 * (1–2 chars), we do a “boundary check” to avoid matching things like "83".
 */
function findAllMatches(textNormalized: string, tokens: string[]) {
  const intervals: Array<[number, number]> = [];

  for (const token of tokens) {
    if (!token) continue;
    let startIndex = 0;

    while (true) {
      const foundIndex = textNormalized.indexOf(token, startIndex);
      if (foundIndex === -1) break;

      // If token is 1–2 chars, do a boundary check to decide if we highlight
      if (token.length <= 2) {
        if (!isBoundaryForShortToken(textNormalized, token, foundIndex)) {
          // skip this occurrence
          startIndex = foundIndex + 1;
          continue;
        }
      }

      intervals.push([foundIndex, foundIndex + token.length]);
      startIndex = foundIndex + token.length;
    }
  }

  return intervals;
}

/**
 * We consider it a boundary if:
 * 1) foundIndex === 0 (start of string), or
 * 2) the character before the match is “not the same type”:
 *    - if token is digit, preceding char is digit => skip
 *    - if token is letter, preceding char is letter => skip
 *    - otherwise => boundary
 */
function isBoundaryForShortToken(textNormalized: string, token: string, foundIndex: number) {
  // If it’s at the very start, that’s a boundary
  if (foundIndex === 0) return true;

  const prevCh = textNormalized[foundIndex - 1];
  // If token has 2 chars, we'll just check its first char to guess "type"
  // (You could refine it, but typically one or both chars are same type.)
  const firstChar = token[0];

  const tokenIsDigit = isDigit(firstChar);
  const tokenIsLetter = isLetter(firstChar);

  const prevIsDigit = isDigit(prevCh);
  const prevIsLetter = isLetter(prevCh);

  // If both are digits -> not a boundary
  if (tokenIsDigit && prevIsDigit) {
    return false;
  }
  // If both are letters -> not a boundary
  if (tokenIsLetter && prevIsLetter) {
    return false;
  }

  // Otherwise, treat it as a boundary
  // e.g. digit -> letter, letter -> digit, punctuation, space, etc.
  return true;
}

function isDigit(ch: string) {
  return /^[0-9]$/.test(ch);
}

function isLetter(ch: string) {
  return /^[a-zа-я]$/i.test(ch);
}

/** Sort intervals by start position and merge them if they overlap. */
function mergeIntervals(intervals: number[][]) {
  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [];
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];

    // If overlapping or contiguous, extend the current interval
    if (next[0] <= current[1]) {
      current[1] = Math.max(current[1], next[1]);
    } else {
      // no overlap
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}

/** Slice the original text into [non-match, match, ...] chunks. */
function buildChunks(originalText: string, intervals: number[][]): Chunk[] {
  const chunks = [];
  let lastEnd = 0;

  for (const [start, end] of intervals) {
    // If there's a gap between lastEnd and start, that's a non-match
    if (start > lastEnd) {
      chunks.push({ text: originalText.slice(lastEnd, start), match: false });
    }

    // The matched substring
    chunks.push({ text: originalText.slice(start, end), match: true });
    lastEnd = end;
  }

  // If there's remaining text after the final interval
  if (lastEnd < originalText.length) {
    chunks.push({ text: originalText.slice(lastEnd), match: false });
  }

  return chunks;
}
