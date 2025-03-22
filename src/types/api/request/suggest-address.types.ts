import type { BOUND_TYPES, DIVISION_TYPES, LANGUAGES, RESTRICTION_TYPES } from '@/const/api';

export type DivisionType = (typeof DIVISION_TYPES)[number];

export type BoundType = (typeof BOUND_TYPES)[number];

export type LocationRestriction = {
  [K in (typeof RESTRICTION_TYPES)[number]]?: string;
};

export interface RadiusFilter {
  lat: string;
  lon: string;
  radius_meters: number;
}

export interface LocationsBoostItem {
  kladr_id: string;
}

export type Language = (typeof LANGUAGES)[number];

export interface SuggestAddressPayload {
  query: string;
  count?: number;
  division?: DivisionType;
  from_bound?: { value: BoundType };
  to_bound?: { value: BoundType };
  locations?: LocationRestriction[];
  locations_geo?: [RadiusFilter];
  locations_boost?: LocationsBoostItem | LocationsBoostItem[];
  restrict_value?: Boolean;
  language?: Language;
}
