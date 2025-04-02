import type { PartyKzType } from './api';
import type { OneOrMany } from './helpers.types';
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
