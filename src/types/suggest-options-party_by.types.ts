import type { BaseSuggestOptions } from './suggest-options.types';
import type { PartyByStatus, PartyByType } from './api';
import type { OneOrMany } from './helpers.types';

/**
 *
 */
export interface SuggestPartyByOptions extends BaseSuggestOptions {
  suggestType: 'party_by';
  entityType?: OneOrMany<PartyByType>;
  entityStatus?: OneOrMany<PartyByStatus>;
  /** Please use `entityType` and `entityStatus` instead */
  filters?: OneOrMany<{ type?: PartyByType; status?: PartyByStatus }>;
}
