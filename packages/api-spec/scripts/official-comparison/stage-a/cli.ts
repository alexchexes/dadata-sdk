import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { CompareOptions, StageAFamilyConfig } from './types.js';

const STDIN_CURATION_PATH = '-';

export function parseStageAOptions(args: string[]): CompareOptions {
  let curationPath: string | null = null;
  let showCuration = false;
  let writeProjectionPath: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--curation') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Missing value for --curation.');
      }

      curationPath = value;
      index += 1;
      continue;
    }

    if (arg === '--write-projection') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Missing value for --write-projection.');
      }

      writeProjectionPath = value;
      index += 1;
      continue;
    }

    if (arg === '--show-curation') {
      showCuration = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    curationPath,
    showCuration,
    writeProjectionPath,
  };
}

export function readStageACurationSource(
  curationPath: string | null,
  config: StageAFamilyConfig,
): string {
  if (curationPath === STDIN_CURATION_PATH) {
    return readFileSync(0, 'utf8');
  }

  return readFileSync(resolve(curationPath ?? config.defaultCurationPath), 'utf8');
}
