import { User } from 'app/routes/auth/auth.interface';
import { NominationBatch } from '../nomination-batches/gas-nomination-batch.interface';
import { Client } from '@routes/client-registration/customers/clients.interface';

export interface GasNomination {
  aboveMaximum: boolean;
  active: boolean;
  batch: NominationBatch;
  belowMinimum: boolean;
  client: Client;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  endDate: string;
  evidenceAttachmentUrl: string;
  evidentAttachment: string;
  groupReferenceNumber: string;
  hourlyFlowSm3PerHour: number;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  nominationDate: string;
  periodType: NominationPeriodType;
  quantityMmscfd: number;
  quantitySm3PerDay: number;
  reason: string;
  referenceNumber: string;
  requestDate: string;
  startDate: string;
  status: NominationStatus;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface GasNominationDtoInput {
  endDate: string;
  evidenceAttachmentBase64: string;
  nominationDate: string;
  periodType: NominationPeriodType;
  quantityMmscfd: number;
  reason: string;
  startDate: string;
  uid: string;
}

export enum NominationPeriodType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
}

export enum NominationStatus {
  AGGREGATED = 'AGGREGATED',
  APPROVED_BY_PIPELINE_MANAGER = 'APPROVED_BY_PIPELINE_MANAGER',
  CAPACITY_UPDATED = 'CAPACITY_UPDATED',
  COMPLETED = 'COMPLETED',
  CONFIRMED_BY_UPSTREAMER = 'CONFIRMED_BY_UPSTREAMER',
  DRAFT = 'DRAFT',
  LATE = 'LATE',
  REJECTED = 'REJECTED',
  RETURNED_TO_PIPELINE_SHIFT_SUPERVISOR = 'RETURNED_TO_PIPELINE_SHIFT_SUPERVISOR',
  SENT_TO_PIPELINE_MANAGER = 'SENT_TO_PIPELINE_MANAGER',
  SENT_TO_PLANT_MANAGER = 'SENT_TO_PLANT_MANAGER',
  SENT_TO_PLANT_SHIFT_SUPERVISOR = 'SENT_TO_PLANT_SHIFT_SUPERVISOR',
  SENT_TO_PLANT_SUPERINTENDENT = 'SENT_TO_PLANT_SUPERINTENDENT',
  SENT_TO_PLANT_SUPERVISOR = 'SENT_TO_PLANT_SUPERVISOR',
  SENT_TO_UPSTREAMER = 'SENT_TO_UPSTREAMER',
  SUBMITTED = 'SUBMITTED',
}

export interface NominationAggregationDtoInput {
  endDate: string;
  nominationDate: string;
  periodType: NominationPeriodType;
  pipelineSupervisorComments: string;
  startDate: string;
}
