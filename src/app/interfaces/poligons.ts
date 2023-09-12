export interface Feature {
  type?: any;
  id?: any;
  geometry?: {
    type?: any;
    coordinates?: any[][][];
  };
  properties?: {
    OBJECTID?: any;
    ACREAGE?: any;
    Longitude?: any;
    Latitude?: any;
    FIELD_ID?: any;
    BSI_CODE?: any;
    DATE_PLANTED?: any;
    VARIETY?: any;
    CROP_CLASS?: any;
    PARCEL_LOCATION?: any;
    SUGARCANE?: any;
    STATUS?: any;
    TERRAIN?: any;
    PRODUCTION_OWNER?: any;
    PROD_MONIT_STATUS?: any;
    GEOGRAPHICAL_ZONE?: any;
    DATE_HARVESTED_2021_2022?: any;
    ASSN?: any;
    GlobalID?: any;
    ROW_WIDTH?: any;
    S3_WEIGHT_10_STALKS?: any;
    STEMBORER_PRESENCE?: any;
    PE_SURVEY_DATE?: any;
    FERTILIZED?: any;
    WEED_CONTROL?: any;
    WEED_PRESENCE?: any;
    CreationDate?: any;
    Creator?: any;
    EditDate?: any;
    Editor?: any;
    // ... (resto de propiedades)
  };
}

export interface FeatureCollection {
  type?: any;
  crs?: {
    type?: any;
    properties?: {
      name?: any;
    };
  };
  features?: Feature[];
}
