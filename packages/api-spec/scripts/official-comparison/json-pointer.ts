/** Escapes one JSON Pointer segment. */
export function escapeJsonPointerSegment(value: string): string {
  return value.replaceAll('~', '~0').replaceAll('/', '~1');
}

/** Unescapes one JSON Pointer segment. */
export function unescapeJsonPointerSegment(value: string): string {
  return value.replaceAll('~1', '/').replaceAll('~0', '~');
}

/** Parses a local ref only when every JSON Pointer segment uses canonical escaping. */
export function parseCanonicalLocalRef(ref: string, context: string): string[] {
  if (ref === '#') {
    return [];
  }

  if (!ref.startsWith('#/')) {
    throw new Error(`${context} must be a local JSON Pointer ref.`);
  }

  const encodedSegments = ref.slice(2).split('/');
  const segments = encodedSegments.map(unescapeJsonPointerSegment);

  if (formatLocalRef(segments) !== ref) {
    throw new Error(`${context} contains noncanonical JSON Pointer escaping: ${ref}.`);
  }

  return segments;
}

/** Formats parsed local-ref segments with canonical JSON Pointer escaping. */
export function formatLocalRef(pointer: string[]): string {
  return pointer.length === 0 ? '#' : `#/${pointer.map(escapeJsonPointerSegment).join('/')}`;
}
