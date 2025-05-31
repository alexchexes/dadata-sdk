import type { PartyKzType, OneOrMany } from '@dadata-sdk/api-types';
import type { BaseSuggestOptions } from './suggest-options.types';

/**
 *
 */
export interface SuggestPartyKzOptions extends BaseSuggestOptions {
  suggestType: 'party_kz';
  entityType?: OneOrMany<PartyKzType>;
  /** Please use `entityType` instead */
  filters?: OneOrMany<{ type?: PartyKzType }>;
}
