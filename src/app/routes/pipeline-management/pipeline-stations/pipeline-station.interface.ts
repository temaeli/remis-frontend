export enum PipelineStationTypeEnum {
  INITIAL = 'INITIAL',
  JUNCTION = 'JUNCTION',
  RECEIVING = 'RECEIVING',
  TERMINAL = 'TERMINAL',
  BVS_WITH_OFFTAKE = 'BVS_WITH_OFFTAKE',
  BVS_WITHOUT_OFFTAKE = 'BVS_WITHOUT_OFFTAKE',
  TAPPING_POINT = 'TAPPING_POINT',
  MPRS = 'MPRS',
  DPRS = 'DPRS',
  OTHER = 'OTHER',
}

export interface PipelineStation {
  id?: number;
  uid?: string;
  name?: string;
  description?: string;
  stationType?: PipelineStationTypeEnum;
  pipelineSegment?: {
    uid?: string;
    segmentId?: string;
    pipelineSection?: {
      uid?: string;
      sectionId?: string;
      pipeline?: { uid?: string; name?: string };
    };
  };
  pipelineSegmentUid?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStationDtoInput {
  uid?: string;
  name: string;
  description: string;
  stationType: PipelineStationTypeEnum;
  pipelineSegmentUid: string;
}
