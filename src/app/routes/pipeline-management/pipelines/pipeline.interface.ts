export interface Pipeline {
  id?: number;
  uid?: string;
  name: string;
  description?: string;
  spatialLength?: number;
  status?: PipelineStatus;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineDtoInput {
  uid?: string;
  name: string;
  description?: string;
  status: PipelineStatus;
}

export enum PipelineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}
