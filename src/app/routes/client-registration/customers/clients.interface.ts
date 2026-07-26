import { AttachmentDtoInput } from '@shared/components/generic-form/attachment/attachment.interface';
import { User } from 'app/routes/auth/auth.interface';
import { Plant } from 'app/routes/plants/plants/plant.interface';
import { IdentificationType } from '../customers-categories/customers-categories.interface';

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

export interface PipelineSegmentMinimal {
  uid?: string;
  segmentId?: string;
}

export interface ClientCategory {
  code?: string;
  description?: string;
  id?: number;
  name?: string;
  uid?: string;
}

export interface Client {
  accountNumber: string;
  active: boolean;
  approvalComments: string;
  approvalStatus: ApprovalStatus;
  approvedAt: string;
  approvedById: number;
  blockNumber: string;
  categories: ClientCategory[];
  clientStatus: ClientStatus;
  clientStreamType: ClientStreamType;
  code: string;
  contactPersonEmail: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contractEndDate: string;
  contractStartDate: string;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  email: string;
  fax: string;
  id: number;
  identificationType: IdentificationType;
  isDeleted: boolean;
  logoUrl: string;
  maximumDailyQuantityMmscfd: number;
  migrated: boolean;
  minimumDailyQuantityMmscfd: number;
  phone: string;
  pipelineSegment: PipelineSegmentMinimal;
  plant: Plant;
  postalAddress: string;
  productionCapacityMmscfd: number;
  registrationStage: ClientRegistrationStage;
  reviewComments: string;
  reviewedAt: string;
  reviewedById: number;
  subWard: SubWardLineage;
  tin: string;
  tinVerificationStatus: TinVerificationStatus;
  tinVerifiedAt: string;
  uid: string;
  updatedAt: string;
  updatedBy: number;
  user: User;
  vrn: string;
}

export enum ApprovalStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export enum ClientRegistrationStage {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ClientStreamType {
  DOWN = 'DOWN',
  UP = 'UP',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum TinVerificationStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  MISMATCH = 'MISMATCH',
  NOT_FOUND = 'NOT_FOUND',
}

export interface ClientSelfRegistrationDtoInput {
  attachmentDtoList: AttachmentDtoInput[];
  blockNumber: string;
  clientStreamType: ClientStreamType;
  contactPersonEmail: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contractEndDate: string;
  contractStartDate: string;
  email: string;
  fax: string;
  firstName: string;
  lastName: string;
  logoUrl: string;
  maximumDailyQuantityMmscfd: number;
  middleName: string;
  minimumDailyQuantityMmscfd: number;
  phone: string;
  pipelineSegmentUid: string;
  plantUid: string;
  postalAddress: string;
  productionCapacityMmscfd: number;
  subWardUid: string;
  tin: string;
  vrn: string;
}

export interface ClientRegistrationApprovalDtoInput {
  approved: boolean;
  clientUid: string;
  comments: string;
}
