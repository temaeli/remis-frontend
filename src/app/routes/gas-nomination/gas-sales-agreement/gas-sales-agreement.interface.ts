export interface GasSalesAgreement {
  activatedAt: Date | string;
  // activatedByUser: User;
  active: boolean;
  addendums: GsaAddendum[];
  client?: { id: number; uid: string };
  clientUid?: string;
  contractName: string;
  contractNumber: string;
  contractType: GsaContractType;
  createdAt: string;
  // createdBy: User;
  createdById: number;
  deletedAt: string;
  deletedBy: number;
  deletedId: number;
  description: string;
  documentUrl: string;
  endDate: string;
  id: number;
  isDeleted: boolean;
  maximumDailyMmscfd: number;
  migrated: boolean;
  minimumDailyMmscfd: number;
  startDate: string;
  status: GsaStatus;
  submittedAt: string;
  // submittedByUser: User;
  totalVolumeMmscf: number;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface GasSalesAgreementDtoInput {
  clientUid: string;
  contractName?: string;
  contractNumber: string;
  description?: string;
  documentBase64?: string;
  endDate: Date | string;
  maximumDailyMmscfd: number;
  minimumDailyMmscfd: number;
  startDate: Date | string;
  totalVolumeMmscf?: number;
  uid?: string;
}

export interface GasSalesAgreementAddendum {
  uid?: string;
  agreementUid?: string;
  referenceNumber?: string;
  content?: string;
  createdAt?: Date | string;
}

export enum GsaContractType {
  DOWNSTREAMER_TPDC = 'DOWNSTREAMER_TPDC',
  UPSTREAMER_TPDC = 'UPSTREAMER_TPDC',
}

export interface GsaAddendum {
  active: boolean;
  addendumDate: Date | string;
  agreement: GasSalesAgreement;
  createdAt: Date | string;
  // createdBy: User;
  createdById: number;
  deletedAt: string;
  deletedBy: number;
  deletedId: number;
  documentUrl: string;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  newEndDate: string;
  newMaximumDailyMmscfd: number;
  newMinimumDailyMmscfd: number;
  reason: string;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export enum GsaStatus {
  ACTIVE = 'ACTIVE',
  APPROVED_BY_MANAGER = 'APPROVED_BY_MANAGER',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  SUBMITTED = 'SUBMITTED',
  SUBMITTED_TO_MANAGER = 'SUBMITTED_TO_MANAGER',
  TERMINATED = 'TERMINATED',
}
