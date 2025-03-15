export interface LocationRestriction {
  // by ISO code
  country_iso_code?: string;
  region_iso_code?: string;

  // by address object name
  country?: string;
  region?: string;
  area?: string;
  city?: string;
  settlement?: string;
  street?: string;

  // by address object type
  region_type_full?: string;
  area_type_full?: string;
  city_type_full?: string;
  settlement_type_full?: string;
  street_type_full?: string;

  // by FIAS code
  fias_id?: string;
  region_fias_id?: string;
  area_fias_id?: string;
  city_fias_id?: string;
  settlement_fias_id?: string;
  street_fias_id?: string;

  // by KLADR code
  kladr_id?: string;
}
