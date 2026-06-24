// Converts raw oasdiff full JSON into small report units. This is intentionally path-schema focused.
import { isRecord } from '../io.js';

export interface DiffUnit {
  added?: unknown;
  from?: unknown;
  kind: string;
  location: string;
  mediaType?: string;
  method: string;
  path: string;
  removed?: unknown;
  side: 'request' | 'response';
  status?: string;
  to?: unknown;
}

interface SnapshotDiffUnit extends DiffUnit {
  required?: boolean;
}

export interface DiffUnitsByPathOperation {
  request: DiffUnit[];
  responses: Record<string, DiffUnit[]>;
  responseStatuses: DiffUnit[];
}

export type DiffUnitsByPath = Record<string, Record<string, DiffUnitsByPathOperation>>;

interface UnitContext {
  mediaType?: string;
  method: string;
  path: string;
  side: DiffUnit['side'];
  status?: string;
  units: DiffUnit[];
}

const SCHEMA_CONSTRAINT_KEYS = new Set([
  'max',
  'maxItems',
  'maximum',
  'maxLength',
  'min',
  'minItems',
  'minimum',
  'minLength',
  'pattern',
]);

const STRUCTURAL_SCHEMA_KEYS = new Set([
  'additionalProperties',
  'allOf',
  'anyOf',
  'items',
  'not',
  'oneOf',
]);

/** Builds deterministic path-level diff units from oasdiff full JSON output. */
export function buildDiffUnits(diff: Record<string, unknown>): DiffUnit[] {
  const units: DiffUnit[] = [];
  const paths = getRecord(getRecord(diff.paths)?.modified);

  if (!paths) {
    return units;
  }

  for (const [path, pathDiff] of sortedRecordEntries(paths)) {
    const operations = getRecord(getRecord(pathDiff)?.operations);

    collectOperationUnits(operations?.added, path, units, 'operation-added');
    collectOperationUnits(operations?.deleted, path, units, 'operation-deleted');

    const modifiedOperations = getRecord(operations?.modified);

    if (!modifiedOperations) {
      continue;
    }

    for (const [method, operationDiff] of sortedRecordEntries(modifiedOperations)) {
      collectRequestBodyUnits(path, method, operationDiff, units);
      collectResponseUnits(path, method, operationDiff, units);
    }
  }

  return sortDiffUnits(units);
}

/** Groups flat diff units by OpenAPI path first, then lowercase method. */
export function buildDiffUnitsByPath(units: DiffUnit[]): DiffUnitsByPath {
  const grouped: DiffUnitsByPath = {};

  for (const unit of units) {
    const method = unit.method.toLowerCase();
    const pathGroup = (grouped[unit.path] ??= {});
    const operationGroup = (pathGroup[method] ??= {
      request: [],
      responses: {},
      responseStatuses: [],
    });

    if (unit.side === 'request') {
      operationGroup.request.push(unit);
      continue;
    }

    if (unit.kind === 'response-status-added' || unit.kind === 'response-status-deleted') {
      operationGroup.responseStatuses.push(unit);
      continue;
    }

    const status = unit.status ?? '<unknown>';

    (operationGroup.responses[status] ??= []).push(unit);
  }

  return sortDiffUnitsByPath(grouped);
}

/** Renders deterministic review-oriented lines while leaving raw diff units unchanged. */
export function renderDiffUnitSnapshot(units: DiffUnit[]): string {
  const lines = sortDiffUnits(coalesceDiffUnitsForSnapshot(units)).map(formatDiffUnitSnapshotLine);

  return lines.length > 0 ? `${lines.join('\n')}\n` : '';
}

/** Coalesces derivative requiredness changes into matching property add/delete units. */
function coalesceDiffUnitsForSnapshot(units: DiffUnit[]): SnapshotDiffUnit[] {
  const unitIdentities = new Set(units.map(getDiffUnitIdentity));

  return units.flatMap((unit): SnapshotDiffUnit[] => {
    const counterpartKind = getRequirednessCounterpartKind(unit.kind);

    if (!counterpartKind || !unitIdentities.has(getDiffUnitIdentity({ ...unit, kind: counterpartKind }))) {
      return [{ ...unit }];
    }

    return unit.kind === 'schema-property-added' || unit.kind === 'schema-property-deleted'
      ? [{ ...unit, required: true }]
      : [];
  });
}

/** Extracts request schema units from one operation diff. */
function collectRequestBodyUnits(
  path: string,
  method: string,
  operationDiff: unknown,
  units: DiffUnit[],
): void {
  const requestBody = getRecord(getRecord(operationDiff)?.requestBody);
  const modifiedContent = getRecord(getRecord(requestBody?.content)?.modified);

  if (!modifiedContent) {
    return;
  }

  for (const [mediaType, mediaTypeDiff] of sortedRecordEntries(modifiedContent)) {
    collectSchemaUnits(getRecord(mediaTypeDiff)?.schema, [], {
      mediaType,
      method,
      path,
      side: 'request',
      units,
    });
  }
}

/** Extracts response status and response schema units from one operation diff. */
function collectResponseUnits(
  path: string,
  method: string,
  operationDiff: unknown,
  units: DiffUnit[],
): void {
  const responses = getRecord(getRecord(operationDiff)?.responses);

  collectResponseStatusUnits(responses?.added, path, method, units, 'response-status-added');
  collectResponseStatusUnits(responses?.deleted, path, method, units, 'response-status-deleted');

  const modifiedResponses = getRecord(responses?.modified);

  if (!modifiedResponses) {
    return;
  }

  for (const [status, responseDiff] of sortedRecordEntries(modifiedResponses)) {
    const modifiedContent = getRecord(getRecord(getRecord(responseDiff)?.content)?.modified);

    if (!modifiedContent) {
      continue;
    }

    for (const [mediaType, mediaTypeDiff] of sortedRecordEntries(modifiedContent)) {
      collectSchemaUnits(getRecord(mediaTypeDiff)?.schema, [], {
        mediaType,
        method,
        path,
        side: 'response',
        status,
        units,
      });
    }
  }
}

/** Walks a schema diff subtree and emits contract-level units. */
function collectSchemaUnits(schemaDiff: unknown, location: string[], context: UnitContext): void {
  if (!isRecord(schemaDiff)) {
    return;
  }

  if (schemaDiff.schemaAdded === true) {
    pushUnit(context, 'schema-added', location);
  }

  if (schemaDiff.schemaDeleted === true) {
    pushUnit(context, 'schema-deleted', location);
  }

  collectAddedRemovedUnit(schemaDiff.type, context, 'schema-type-changed', location);
  collectAddedRemovedUnit(
    schemaDiff.listOfTypes,
    context,
    'schema-composition-types-changed',
    location,
  );
  collectFromToUnit(schemaDiff.format, context, 'schema-format-changed', location);
  collectEnumUnits(schemaDiff.enum, context, location);
  collectRequiredUnits(schemaDiff.required, context, location);
  collectPropertyUnits(schemaDiff.properties, context, location);

  for (const key of SCHEMA_CONSTRAINT_KEYS) {
    collectFromToUnit(schemaDiff[key], context, `schema-${key}-changed`, location);
  }

  for (const key of STRUCTURAL_SCHEMA_KEYS) {
    collectStructuralSchemaUnits(schemaDiff[key], context, [...location, key]);
  }
}

/** Emits added/deleted operation units from collection diffs. */
function collectOperationUnits(value: unknown, path: string, units: DiffUnit[], kind: string): void {
  for (const method of collectionItems(value)) {
    units.push({
      kind,
      location: '<operation>',
      method: String(method).toUpperCase(),
      path,
      side: 'request',
    });
  }
}

/** Emits added/deleted response status units from collection diffs. */
function collectResponseStatusUnits(
  value: unknown,
  path: string,
  method: string,
  units: DiffUnit[],
  kind: string,
): void {
  for (const status of collectionItems(value)) {
    units.push({
      kind,
      location: '<response>',
      method,
      path,
      side: 'response',
      status: String(status),
    });
  }
}

/** Emits schema property added/deleted units and recurses into modified properties. */
function collectPropertyUnits(value: unknown, context: UnitContext, location: string[]): void {
  const properties = getRecord(value);

  if (!properties) {
    return;
  }

  for (const propertyName of collectionItems(properties.added)) {
    pushUnit(context, 'schema-property-added', [...location, String(propertyName)], {
      added: propertyName,
    });
  }

  for (const propertyName of collectionItems(properties.deleted)) {
    pushUnit(context, 'schema-property-deleted', [...location, String(propertyName)], {
      removed: propertyName,
    });
  }

  const modified = getRecord(properties.modified);

  if (!modified) {
    return;
  }

  for (const [propertyName, propertyDiff] of sortedRecordEntries(modified)) {
    collectSchemaUnits(propertyDiff, [...location, propertyName], context);
  }
}

/** Emits required property added/deleted units. */
function collectRequiredUnits(value: unknown, context: UnitContext, location: string[]): void {
  const required = getRecord(value);

  if (!required) {
    return;
  }

  for (const propertyName of collectionItems(required.added)) {
    pushUnit(context, 'schema-required-added', [...location, String(propertyName)], {
      added: propertyName,
    });
  }

  for (const propertyName of collectionItems(required.deleted)) {
    pushUnit(context, 'schema-required-deleted', [...location, String(propertyName)], {
      removed: propertyName,
    });
  }
}

/** Emits enum value added/deleted units, including oasdiff's enumAdded/enumDeleted shape. */
function collectEnumUnits(value: unknown, context: UnitContext, location: string[]): void {
  const enumDiff = getRecord(value);

  if (!enumDiff) {
    return;
  }

  for (const enumValue of collectionItems(enumDiff.added)) {
    pushUnit(context, 'schema-enum-value-added', location, {
      added: enumValue,
    });
  }

  for (const enumValue of collectionItems(enumDiff.deleted)) {
    pushUnit(context, 'schema-enum-value-deleted', location, {
      removed: enumValue,
    });
  }
}

/** Recurses into nested schema containers such as items and compositions. */
function collectStructuralSchemaUnits(value: unknown, context: UnitContext, location: string[]): void {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      collectSchemaUnits(item, [...location, String(index)], context);
    }

    return;
  }

  const record = getRecord(value);

  if (!record) {
    return;
  }

  collectSchemaUnits(record, location, context);

  const modified = getRecord(record.modified);

  if (modified) {
    for (const [name, child] of sortedRecordEntries(modified)) {
      collectSchemaUnits(child, [...location, name], context);
    }
  }
}

/** Emits one unit for a scalar `{ from, to }` diff. */
function collectFromToUnit(
  value: unknown,
  context: UnitContext,
  kind: string,
  location: string[],
): void {
  if (!isRecord(value) || !('from' in value) || !('to' in value)) {
    return;
  }

  pushUnit(context, kind, location, {
    from: value.from,
    to: value.to,
  });
}

/** Emits one unit for an added/deleted collection diff. */
function collectAddedRemovedUnit(
  value: unknown,
  context: UnitContext,
  kind: string,
  location: string[],
): void {
  const record = getRecord(value);

  if (!record) {
    return;
  }

  const added = collectionItems(record.added);
  const removed = collectionItems(record.deleted);

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  pushUnit(context, kind, location, {
    added,
    removed,
  });
}

/** Adds a normalized unit to the current collection. */
function pushUnit(
  context: UnitContext,
  kind: string,
  location: string[],
  extra: Partial<Pick<DiffUnit, 'added' | 'from' | 'removed' | 'to'>> = {},
): void {
  const unit: DiffUnit = {
    kind,
    location: formatLocation(location),
    mediaType: context.mediaType,
    method: context.method.toUpperCase(),
    path: context.path,
    side: context.side,
    status: context.status,
  };

  Object.assign(unit, extra);
  context.units.push(unit);
}

/** Returns object entries sorted by key for deterministic output. */
function sortedRecordEntries(value: Record<string, unknown>): [string, unknown][] {
  return Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
}

/** Narrows a value to a plain object record. */
function getRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

/** Normalizes oasdiff collection values to item arrays. */
function collectionItems(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    return Object.keys(value);
  }

  return [];
}

/** Formats a schema location with the same compact style as the old breaking output. */
function formatLocation(location: string[]): string {
  return location.length === 0 ? '<schema>' : location.join('/');
}

/** Sorts units so JSON artifacts and report samples are stable. */
function sortDiffUnits(units: DiffUnit[]): DiffUnit[] {
  return units.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.method.localeCompare(right.method) ||
      left.side.localeCompare(right.side) ||
      (left.status ?? '').localeCompare(right.status ?? '') ||
      left.location.localeCompare(right.location) ||
      left.kind.localeCompare(right.kind) ||
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );
}

/** Maps property and requiredness kinds to their coalescing counterpart. */
function getRequirednessCounterpartKind(kind: string): string | null {
  if (kind === 'schema-property-added') {
    return 'schema-required-added';
  }

  if (kind === 'schema-property-deleted') {
    return 'schema-required-deleted';
  }

  if (kind === 'schema-required-added') {
    return 'schema-property-added';
  }

  return kind === 'schema-required-deleted' ? 'schema-property-deleted' : null;
}

/** Builds a stable complete identity for one diff unit. */
function getDiffUnitIdentity(unit: DiffUnit): string {
  return JSON.stringify(canonicalizeSnapshotValue(unit));
}

/** Sorts grouped units so the path-first JSON artifact is stable. */
function sortDiffUnitsByPath(grouped: DiffUnitsByPath): DiffUnitsByPath {
  const sorted: DiffUnitsByPath = {};

  for (const path of Object.keys(grouped).sort((left, right) => left.localeCompare(right))) {
    const methods = grouped[path] ?? {};
    sorted[path] = {};

    for (const method of Object.keys(methods).sort((left, right) => left.localeCompare(right))) {
      const operation = methods[method] ?? {
        request: [],
        responses: {},
        responseStatuses: [],
      };
      const responses: Record<string, DiffUnit[]> = {};

      for (const status of Object.keys(operation.responses).sort((left, right) => left.localeCompare(right))) {
        responses[status] = sortDiffUnits([...operation.responses[status]]);
      }

      sorted[path][method] = {
        request: sortDiffUnits([...operation.request]),
        responses,
        responseStatuses: sortDiffUnits([...operation.responseStatuses]),
      };
    }
  }

  return sorted;
}

/** Formats one diff unit as a stable single-line snapshot record. */
function formatDiffUnitSnapshotLine(unit: SnapshotDiffUnit): string {
  return [
    unit.path,
    unit.method,
    unit.side,
    unit.status,
    unit.mediaType,
    unit.location,
    unit.kind,
    ...formatDiffUnitValueFields(unit),
  ]
    .filter((part): part is string => part !== undefined)
    .join(' ');
}

/** Formats changed value fields in a fixed order. */
function formatDiffUnitValueFields(unit: DiffUnit): string[] {
  const fields: string[] = [];

  appendDiffUnitValueField(fields, unit, 'added');
  appendDiffUnitValueField(fields, unit, 'removed');
  appendDiffUnitValueField(fields, unit, 'from');
  appendDiffUnitValueField(fields, unit, 'to');

  if ('required' in unit) {
    fields.push(`required=${String(unit.required)}`);
  }

  return fields;
}

/** Appends a value field only when the unit explicitly contains that property. */
function appendDiffUnitValueField(
  fields: string[],
  unit: DiffUnit,
  key: 'added' | 'from' | 'removed' | 'to',
): void {
  if (Object.prototype.hasOwnProperty.call(unit, key)) {
    fields.push(`${key}=${stringifySnapshotValue(unit[key])}`);
  }
}

/** Stringifies values after recursively sorting unordered collections from oasdiff. */
function stringifySnapshotValue(value: unknown): string {
  return JSON.stringify(canonicalizeSnapshotValue(value));
}

/** Canonicalizes values for stable one-line snapshots. */
function canonicalizeSnapshotValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(canonicalizeSnapshotValue)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  }

  if (!isRecord(value)) {
    return value;
  }

  const sorted: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right))) {
    sorted[key] = canonicalizeSnapshotValue(child);
  }

  return sorted;
}
