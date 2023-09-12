export interface MyData {
  displayFieldName?: any;
  fieldAliases?: {
    OBJECTID?: any;
    ACREAGE?: any;
    Longitude?: any;
    Latitude?: any;
    FIELD_ID?: any;
  };
  geometryType?: any;
  spatialReference?: {
    wkid?: any;
    latestWkid?: any;
  };
  fields?: {
    name?: any;
    type?: any;
    alias?: any;
    length?: any;
  }[];
  features?: {
    attributes?: {
      OBJECTID?: any;
      ACREAGE?: any;
      Longitude?: any;
      Latitude?: any;
      FIELD_ID?: any;
    };
    geometry: {
      x?: any;
      y?: any;
    };
  }[];
}

export interface Features {
  attributes?: {
    OBJECTID?: any;
    ACREAGE?: any;
    Longitude?: any;
    Latitude?: any;
    FIELD_ID?: any;
  };
  geometry?: {
    x?: any;
    y?: any;
  };
}
[];
