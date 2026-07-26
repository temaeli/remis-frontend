import { User } from '@routes/auth/auth.interface';
import { Plant } from '@routes/plants/plants/plant.interface';

export interface PlantExportReading {
  active?: boolean;
  createdAt?: string;
  createdBy?: User;
  createdById?: number;
  deletedAt?: string;
  deletedBy?: number;
  deletedId?: number;
  exportedGas?: number;
  id?: number;
  isDeleted?: boolean;
  migrated?: boolean;
  hhv?: number;
  lhv?: number;
  pipelineExportFlowRate?: number;
  pipelineExportPressure?: number;
  pipelineExportTemperature?: number;
  plant?: Plant;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface PlantExportReadingDtoInput {
  exportedGas?: number;
  pipelineExportFlowRate?: number;
  pipelineExportPressure?: number;
  pipelineExportTemperature?: number;
  plantUid?: string;
  uid?: string;

  availableCapacity?: number;
  flaredGas?: number;
  producedGas?: number;
  utilizedCapacity?: number;
}
