export interface PipelineStationDischarge {
  id?: number;
  uid?: string;
  name?: string;
  description?: string;
  station?: { uid?: string; name?: string };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStationDischargeDtoInput {
  uid?: string;
  name: string;
  description?: string;
  pipelineStationUid: string;
}
