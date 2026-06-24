import type { StageBOptions } from './types.js';

const DEFAULT_MAX_GROUPS = 8;
const DEFAULT_MAX_SAMPLES = 2;

/** Parses shared Stage B CLI options. */
export function parseStageBOptions(args: string[]): StageBOptions {
  let checkSnapshot = false;
  let curationPath: string | null = null;
  let keepTemp = false;
  let maxGroups = DEFAULT_MAX_GROUPS;
  let maxSamples = DEFAULT_MAX_SAMPLES;
  let oasdiffBin: string | null = null;
  let updateSnapshot = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--check-snapshot') {
      checkSnapshot = true;
      continue;
    }

    if (arg === '--curation') {
      curationPath = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--keep-temp') {
      keepTemp = true;
      continue;
    }

    if (arg === '--max-groups') {
      maxGroups = parsePositiveInteger(requireOptionValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === '--max-samples') {
      maxSamples = parsePositiveInteger(requireOptionValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === '--oasdiff-bin') {
      oasdiffBin = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--update-snapshot') {
      updateSnapshot = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (checkSnapshot && updateSnapshot) {
    throw new Error('--check-snapshot and --update-snapshot cannot be used together.');
  }

  return {
    checkSnapshot,
    curationPath,
    keepTemp,
    maxGroups,
    maxSamples,
    oasdiffBin,
    updateSnapshot,
  };
}

function requireOptionValue(args: string[], index: number, optionName: string): string {
  const value = args[index + 1];

  if (!value) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return value;
}

function parsePositiveInteger(value: string, optionName: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${optionName} must be a positive integer.`);
  }

  return parsed;
}
