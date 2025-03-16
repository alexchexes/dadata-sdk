import { LOCATION_RESTRICTION_KEYS } from '@/const';

export type LocationRestriction = {
  [K in (typeof LOCATION_RESTRICTION_KEYS)[number]]?: string;
};
