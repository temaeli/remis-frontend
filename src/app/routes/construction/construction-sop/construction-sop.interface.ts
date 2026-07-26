import { User } from 'app/routes/auth/auth.interface';

export interface ConstructionSopRecord {
  active: boolean;
  approvedAt: string;
  approver: User;
  approverComments: string;
  checklistItems: [ConstructionSopChecklistItem];
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  executionDate: string;
  executionTime: string;
  fieldEngineer: User;
  id: number;
  isDeleted: boolean;
  location: string;
  migrated: boolean;
  nonConformities: [ConstructionNonConformity];
  qcInspector: User;
  referenceNumber: string;
  reviewedAt: string;
  sop: SopCatalogEntry;
  status: SopExecutionStatus;
  submittedAt: string;
  summary: string;
  supervisor: User;
  teamId: string;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface ConstructionSopRecordDtoInput {
  checklistItems: [ConstructionSopChecklistItemDtoInput];
  executionDate: string;
  executionTime: string;
  fieldEngineerUid: string;
  location: string;
  qcInspectorUid: string;
  sopCatalogUid: string;
  summary: string;
  supervisorUid: string;
  teamId: string;
  uid: string;
}

export interface ConstructionSopChecklistItem {
  active: boolean;
  comment: string;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  description: string;
  evidenceAttachmentUrl: string;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  ordering: number;
  outcome: SopChecklistOutcome;
  record: ConstructionSopRecord;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface ConstructionSopChecklistItemDtoInput {
  comment: string;
  description: string;
  evidenceAttachmentBase64: string;
  ordering: number;
  outcome: SopChecklistOutcome;
  uid: string;
}

export interface ConstructionNonConformity {
  active: boolean;
  correctiveAction: string;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  description: string;
  dueDate: string;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  record: ConstructionSopRecord;
  resolutionNotes: string;
  responsibleParty: User;
  status: NonConformityStatus;
  uid: string;
  updatedAt: string;
  updatedBy: number;
}

export interface SopCatalogEntry {
  active: boolean;
  code: string;
  createdAt: string;
  createdBy: User;
  deletedAt: string;
  deletedBy: number;
  description: string;
  id: number;
  isDeleted: boolean;
  migrated: boolean;
  name: string;
  uid: string;
  updatedAt: string;
  updatedBy: number;
  version: string;
  purpose: string;
  scope: string;
  responsibilities: string;
  procedureSteps: string;
  referenceDocuments: string;
  tools: string;
  attachmentUrl: string;
}

export interface SopCatalogVersion {
  active: boolean;
  createdAt: string;
  id: number;
  uid: string;
  sop: SopCatalogEntry;
  version: string;
  changeNote: string;
  name: string;
  description: string;
  purpose: string;
  scope: string;
  responsibilities: string;
  procedureSteps: string;
  referenceDocuments: string;
  tools: string;
  attachmentUrl: string;
}

export enum SopAssignmentScope {
  PROJECT = 'PROJECT',
  CATEGORY = 'CATEGORY',
  ACTIVITY = 'ACTIVITY',
}

export interface ConstructionSopAssignment {
  active: boolean;
  createdAt: string;
  id: number;
  uid: string;
  sop: SopCatalogEntry;
  scope: SopAssignmentScope;
  project?: { id: number; uid: string; name: string };
  category?: { id: number; uid: string; name: string };
  activity?: { id: number; uid: string; name: string };
}

export interface ConstructionSopAssignmentDtoInput {
  uid?: string;
  sopUid: string;
  projectUid?: string;
  categoryUid?: string;
  activityUid?: string;
}

export enum SopExecutionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SopChecklistOutcome {
  FAIL = 'FAIL',
  NA = 'NA',
  PASS = 'PASS',
}

export enum NonConformityStatus {
  CLOSED = 'CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
}
