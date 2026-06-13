import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import YAML from 'yaml';

import { readJson, writeJson } from '../io.js';
import { parseStageAOptions, readStageACurationSource } from './cli.js';
import { parseStageACuration } from './curation.js';
import {
  compareStageA,
  extractOfficialOperations,
  extractOurFamilyOperations,
} from './inventory.js';
import { buildProjectedOfficialSpec } from './projection.js';
import { printProjectionReport, printStageAReport } from './report.js';
import type { StageAFamilyConfig } from './types.js';

const INVOCATION_CWD = process.env.INIT_CWD ?? process.cwd();

/** Runs the shared Stage A operation inventory/projection gate for one official family. */
export function runStageAComparison(
  config: StageAFamilyConfig,
  args = process.argv.slice(2),
): void {
  const options = parseStageAOptions(args);
  const officialSpec = YAML.parse(
    readFileSync(resolve(config.officialSourcePath), 'utf8'),
  ) as OpenAPIV3_1.Document;
  const ourSpec = readJson<OpenAPIV3_1.Document>(
    resolve(config.ourSpecPath ?? 'dadata.json'),
    'our dadata.json',
  );
  const curation = parseStageACuration(readStageACurationSource(options.curationPath, config), config);

  const officialOperations = extractOfficialOperations(officialSpec, config);
  const ourFamilyOperations = extractOurFamilyOperations(ourSpec, officialOperations);
  const comparison = compareStageA(officialOperations, ourFamilyOperations, curation, config);

  printStageAReport(
    comparison.units,
    comparison.issues,
    officialOperations,
    ourFamilyOperations,
    options,
    config,
  );

  if (comparison.issues.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (options.writeProjectionPath) {
    const projection = buildProjectedOfficialSpec(
      comparison.units,
      officialOperations,
      officialSpec,
      config,
    );
    const outputPath = resolve(INVOCATION_CWD, options.writeProjectionPath);

    mkdirSync(dirname(outputPath), { recursive: true });
    writeJson(outputPath, projection.document);
    printProjectionReport(projection, outputPath);
  }
}
