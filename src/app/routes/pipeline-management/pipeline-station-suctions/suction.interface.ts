export interface PipelineStationSuction {
  id?: number;
  uid?: string;
  name?: string;
  description?: string;
  station?: { uid?: string; name?: string };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStationSuctionDtoInput {
  uid?: string;
  name: string;
  description?: string;
  pipelineStationUid: string;
}
