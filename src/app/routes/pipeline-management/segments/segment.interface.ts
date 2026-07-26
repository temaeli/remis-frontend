export interface Coordinate {
  elevation: number;
  latitude: number;
  longitude: number;
}

export interface CoordinateDtoInput {
  elevation?: number;
  latitude: number;
  longitude: number;
}

export interface SubWardLineage {
  uid?: string;
  name?: string;
  ward?: {
    uid?: string;
    name?: string;
    district?: {
      uid?: string;
      name?: string;
      region?: { uid?: string; name?: string };
    };
  };
}

export interface PipelineSegment {
  id?: number;
  uid?: string;
  segmentId: string;
  wallThickness?: number;
  elevation?: number;
  pipelineSection?: { uid?: string; sectionId?: string };
  suction?: { uid?: string; name?: string; station?: { uid?: string; name?: string } };
  discharge?: { uid?: string; name?: string; station?: { uid?: string; name?: string } };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineSegmentDtoInput {
  uid?: string;
  segmentId: string;
  wallThickness: number;
  elevation: number;
  sectionUid: string;
}
