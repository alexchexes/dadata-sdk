import type { BaseSuggestOptions } from './suggest-options.types';
import type { PartyByStatus, PartyByType, OneOrMany } from '@dadata-sdk/api-types';

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
