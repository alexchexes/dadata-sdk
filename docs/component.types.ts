import type { VueDadataOptions } from '../packages/vue-dadata/src/types/component-options.types';

// CAN'T USE IT NOW; IF WE UNCOMMENT THIS, ts-json-schema-generator STARTS GENERATING InputHTMLAttributes (sic!)
// export type InputHTMLAttributesStub = Record<string, string | unknown>;

export interface VueDadataOptionsDocs extends VueDadataOptions {
  inputAttributes: Record<string, string | unknown>;

  // inputAttributes: InputHTMLAttributesStub;
}
