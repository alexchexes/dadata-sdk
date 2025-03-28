import type { DIVISION_TYPES, LANGUAGES } from '@/const/api';
import type {
  BaseSuggestPayload,
  BoundType,
  KladrIdFilter,
  LocationRestriction,
} from './suggest-payload.types';

export interface RadiusFilter {
  lat: string;
  lon: string;
  radius_meters: number;
}

export type Language = (typeof LANGUAGES)[number];

export type DivisionType = (typeof DIVISION_TYPES)[number];

/**
 *
 */
export interface SuggestAddressPayload extends BaseSuggestPayload {
  locations_boost?: KladrIdFilter[];
  from_bound?: { value: BoundType };
  to_bound?: { value: BoundType };
  locations?: LocationRestriction[];
  restrict_value?: Boolean;
  locations_geo?: [RadiusFilter];
  language?: Language;
  division?: DivisionType;
}
