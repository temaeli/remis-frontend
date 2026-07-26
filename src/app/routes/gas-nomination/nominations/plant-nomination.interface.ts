import { User } from 'app/routes/auth/auth.interface';
import { NominationStatus } from './gas-nomination.interface';
import {
  NominationBatch,
  NominationBatchItem,
} from '../nomination-batches/gas-nomination-batch.interface';
import { Plant } from '../../plants/plants/plant.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';

export interface PlantNomination {
  active: boolean;
  allocatedDailyMmscfd: number;
  allocatedDailySm3: number;
  allocatedHourlyFlowSm3PerHour: number;
  assignedItemsCount: number;
  batch: NominationBatch;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  id: number;
  isDeleted: boolean;
  items: PlantNominationItem[];
  migrated: boolean;
  plant: Plant;
  plantDailyProductionCapacityMmscfd: number;
  reviewedAt: string;
  reviewedByUser: User;
  sentToUpstreamerAt: string;
  status: NominationStatus;
  supervisorComments: string;
  supervisorReviewStatus: ApprovalStatus;
  uid: string;
  updatedAt: string;
  updatedBy: number;
  upstreamerCapacityMmscfd: number;
}

export interface PlantNominationItem {
  active: boolean;
  allocatedDailyMmscfd: number;
  allocatedDailySm3: number;
  allocatedHourlyFlowSm3PerHour: number;
  batchItem: NominationBatchItem;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  nominationDate: string;
  plantNomination: PlantNomination;
  status: NominationStatus;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}
