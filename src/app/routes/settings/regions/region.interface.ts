export interface Region {
  code?: string;
  // districts?: District[];
  name?: string;
  napaId?: number;
  uid?: string;
}

export interface RegionDtoInput {
  code?: string;
  name?: string;
  uid?: string;
}
