export interface LandParcel {
  active?: boolean;
  createdAt?: string;
  id?: number;
  location?: string;
  sizeSqm?: number;
  titleNumber: string;
  uid?: string;
}

export interface LandParcelDtoInput {
  id?: number;
  location?: string;
  sizeSqm?: number;
  titleNumber: string;
}
