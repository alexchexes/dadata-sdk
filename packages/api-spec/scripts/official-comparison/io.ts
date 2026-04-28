import { readFileSync, writeFileSync } from 'node:fs';

/** Parses JSON and includes the input label in failures. */
export function parseJson<T>(source: string, label: string): T {
  try {
    return JSON.parse(source) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Failed to parse ${label}: ${message}`);
  }
}

/** Reads a UTF-8 JSON file with labelled parse errors. */
export function readJson<T>(path: string, label: string): T {
  return parseJson<T>(readFileSync(path, 'utf8'), label);
}

/** Writes stable pretty JSON with a trailing newline. */
export function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

/** Deep-clones JSON-compatible values. */
export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Deep-clones optional JSON-compatible values while preserving undefined. */
export function cloneOptionalJson<T>(value: T | undefined): T | undefined {
  return value === undefined ? undefined : cloneJson(value);
}

/** Narrows plain object-like values. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
