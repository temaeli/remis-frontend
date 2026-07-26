import { User } from 'app/routes/auth/auth.interface';
import { NominationPeriodType, NominationStatus } from '../nominations/gas-nomination.interface';
import { PlantNomination } from '../nominations/plant-nomination.interface';

export interface NominationBatch {
  active: boolean;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  endDate: string;
  id: number;
  isDeleted: boolean;
  items: NominationBatchItem[];
  migrated: boolean;
  nominationDate: string;
  periodType: NominationPeriodType;
  pipelineSupervisorComments: string;
  pipelineSupervisorUser: User;
  plantNominations: PlantNomination[];
  referenceNumber: string;
  requestDate: string;
  startDate: string;
  status: NominationStatus;
  submittedToPlantSupervisorAt: string;
  totalDemandMmscfd: number;
  totalDemandSm3PerDay: number;
  totalHourlyFlowSm3PerHour: number;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface NominationBatchItem {
  active: boolean;
  batch: NominationBatch;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  nominationDate: string;
  nominationsCount: number;
  status: NominationStatus;
  totalDemandMmscfd: number;
  totalDemandSm3PerDay: number;
  totalHourlyFlowSm3PerHour: number;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface PlantNominationReviewDtoInput {
  approved: boolean;
  plantNominationUid: string;
  sendToUpstreamer: boolean;
  supervisorComments: string;
  upstreamerCapacityMmscfd: number;
}
