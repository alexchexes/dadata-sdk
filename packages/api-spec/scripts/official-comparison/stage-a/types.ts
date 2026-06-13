import type { OpenAPIV3_1 } from '@scalar/openapi-types';

import type { HttpMethod } from '../openapi.js';

export type ComparisonUnitKind = 'official-concrete' | 'template-expansion' | 'extension';
export type RefIdentity = string | null;

export interface OperationRecord {
  path: string;
  method: HttpMethod;
  operation: OpenAPIV3_1.OperationObject;
  requestRef: RefIdentity;
  responseRef: RefIdentity;
}

export interface OfficialTemplateOperationRecord extends OperationRecord {
  prefix: string;
}

export interface OfficialOperationInventory {
  concrete: Map<string, OperationRecord>;
  templates: OfficialTemplateOperationRecord[];
}

export interface OperationIdentity {
  path: string;
  method: HttpMethod;
}

export interface OfficialTemplateIdentity {
  pathTemplate: string;
  method: HttpMethod;
}

export interface TemplateExpansionMapping {
  our: OperationIdentity;
  official: OfficialTemplateIdentity;
}

export interface ExtensionMapping {
  our: OperationIdentity;
}

export interface StageACuration {
  version: 1;
  family: string;
  operations: {
    extensions: ExtensionMapping[];
    templateExpansions: TemplateExpansionMapping[];
  };
}

export interface ComparisonUnit {
  path: string;
  method: HttpMethod;
  kind: ComparisonUnitKind;
  officialSourcePath: string | null;
  officialRequestRef: RefIdentity;
  officialResponseRef: RefIdentity;
  ourRequestRef: RefIdentity;
  ourResponseRef: RefIdentity;
}

export interface CompareOptions {
  curationPath: string | null;
  showCuration: boolean;
  writeProjectionPath: string | null;
}

export interface ProjectionResult {
  document: OpenAPIV3_1.Document;
  projectedOperationCount: number;
  projectedPathCount: number;
  concreteOperationCount: number;
  templateExpandedOperationCount: number;
  excludedExtensionCount: number;
}

export interface StageAFamilyConfig {
  defaultCurationPath: string;
  family: string;
  officialPathPrefix: string;
  officialSourcePath: string;
  ourSpecPath?: string;
  reportTitle: string;
}

export interface StageAComparisonResult {
  issues: string[];
  units: ComparisonUnit[];
}
