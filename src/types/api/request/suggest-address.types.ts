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

export interface BaseSuggestAddressPayload {
  query: string;
  count?: number;
  locations_boost?: LocationsBoostItem | LocationsBoostItem[];
  restrict_value?: Boolean;
}

export interface SuggestAddressPayload extends BaseSuggestAddressPayload {
  division?: DivisionType;
  from_bound?: { value: BoundType };
  to_bound?: { value: BoundType };
  locations?: LocationRestriction[];
  locations_geo?: [RadiusFilter];
  language?: Language;
}

// FIAS

export type BoundTypeFias = Exclude<BoundType, 'country'>;
export type LocationRestrictionFias = Omit<LocationRestriction, 'country'>;

export interface SuggestFiasPayload extends BaseSuggestAddressPayload {
  from_bound?: { value: BoundTypeFias };
  to_bound?: { value: BoundTypeFias };
  locations?: LocationRestrictionFias[];
}
