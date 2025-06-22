import type { VueDadataOptions } from '../packages/vue-dadata/src/types/component-options.types';

/** @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement */
export type InputHTMLAttributes = Record<string, unknown>;

export interface VueDadataOptionsDocs extends VueDadataOptions {
  inputAttributes: InputHTMLAttributes;
}
