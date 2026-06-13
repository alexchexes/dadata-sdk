import type {
  CompareOptions,
  ComparisonUnit,
  OfficialOperationInventory,
  OperationRecord,
  ProjectionResult,
  StageAFamilyConfig,
} from './types.js';
import { formatNullable } from './utils.js';

export function printStageAReport(
  units: ComparisonUnit[],
  issues: string[],
  official: OfficialOperationInventory,
  ours: Map<string, OperationRecord>,
  compareOptions: CompareOptions,
  config: StageAFamilyConfig,
): void {
  const concreteUnits = units.filter((unit) => unit.kind === 'official-concrete');
  const templateUnits = units.filter((unit) => unit.kind === 'template-expansion');
  const extensionUnits = units.filter((unit) => unit.kind === 'extension');

  console.info(`${config.reportTitle}\n`);
  console.info('Summary:');
  console.info(`- official concrete operations: ${official.concrete.size}`);
  console.info(`- official generic templates: ${official.templates.length}`);
  console.info(`- our compared operations: ${ours.size}`);
  console.info(`- comparison units: ${units.length}`);
  console.info(`- official-concrete units: ${concreteUnits.length}`);
  console.info(`- template-expansion units: ${templateUnits.length}`);
  console.info(`- extension units: ${extensionUnits.length}`);
  console.info(`- mismatches: ${issues.length}`);

  if (compareOptions.showCuration && units.length > 0) {
    printCuratedUnits(units);
  } else if (units.length > 0) {
    console.info('\nNotes:');
    console.info('- Run with `--show-curation` to inspect curated mappings and extensions.');
  }

  if (issues.length > 0) {
    console.info('\nMismatches:');

    for (const issue of issues) {
      console.info(`- ${issue}`);
    }
  }
}

export function printProjectionReport(projection: ProjectionResult, outputPath: string): void {
  console.info('\nProjection written:');
  console.info(`- output: ${outputPath}`);
  console.info(`- projected paths: ${projection.projectedPathCount}`);
  console.info(`- projected operations: ${projection.projectedOperationCount}`);
  console.info(`- concrete operations copied: ${projection.concreteOperationCount}`);
  console.info(`- template-expanded operations copied: ${projection.templateExpandedOperationCount}`);
  console.info(`- extensions excluded: ${projection.excludedExtensionCount}`);
}

function printCuratedUnits(units: ComparisonUnit[]): void {
  const curatedUnits = units.filter((unit) => unit.kind !== 'official-concrete');

  console.info('\nCurated mappings and extensions:');

  for (const unit of curatedUnits) {
    console.info(`- [${unit.kind}] ${unit.method.toUpperCase()} ${unit.path}`);
    console.info(`  official source: ${unit.officialSourcePath ?? 'none'}`);
    console.info(`  official request: ${formatNullable(unit.officialRequestRef)}`);
    console.info(`  official response: ${formatNullable(unit.officialResponseRef)}`);
    console.info(`  our request: ${formatNullable(unit.ourRequestRef)}`);
    console.info(`  our response: ${formatNullable(unit.ourResponseRef)}`);
  }
}
