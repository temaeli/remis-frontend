import { ProcessStatus } from '@shared/crud';

export enum IncidentActor {
  STAFF = 'STAFF',
  SHIFT_SUPERVISOR = 'SHIFT_SUPERVISOR',
  HSE_OFFICER = 'HSE_OFFICER',
  MANAGER = 'MANAGER',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
}

export interface IncidentApprovalStage {
  uid?: string;
  actor?: IncidentActor;
  status?: string;
  actedAt?: string;
  comments?: string;
  notes?: string;
  actedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
}

export interface Incident {
  id?: number;
  uid?: string;
  immediateCause: string;
  rootCause?: string;
  detailedDescription?: string;
  location: string;
  reportedBy: string;
  timeHappened: string;
  incidentType?: { uid?: string; name?: string };
  workStation?: { uid?: string; name?: string };
  immediateActionTaken?: string;
  proposedActionToPreventReoccurrence?: string;
  hseo?: { uid?: string; firstName?: string; lastName?: string };
  affectedPersonnel?: IncidentAffectedPersonnel[];
  status?: ProcessStatus;
  currentActor?: IncidentApprovalStage;
  reviewedAt?: string;
  active?: boolean;
  createdAt?: string;
}

export interface IncidentDtoInput {
  uid?: string;
  immediateCause: string;
  rootCause?: string;
  detailedDescription?: string;
  location: string;
  reportedBy: string;
  timeHappened: string;
  incidentTypeUid: string;
  workStationUid: string;
  immediateActionTaken?: string;
  proposedActionToPreventReoccurrence?: string;
}

export interface IncidentAffectedPersonnel {
  uid?: string;
  affectationType?: string;
  description?: string;
  name?: string;
}

export interface IncidentAffectedPersonnelDtoInput {
  uid?: string;
  name?: string;
  affectationType?: string;
  description?: string;
  incidentUid?: string;
}

export interface IncidentAffectedAsset {
  uid?: string;
  affectationType?: string;
  name?: string;
  specification?: string;
  description?: string;
}

export interface IncidentAffectedAssetDtoInput {
  uid?: string;
  name?: string;
  specification?: string;
  affectationType?: string;
  description?: string;
  incidentUid?: string;
}

export enum AffectationType {
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  FATAL = 'FATAL',
}

// Assets can't be fatally affected — mirror the personnel set minus FATAL.
export enum AssetImpactLevel {
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
}

export interface IncidentAttachment {
  uid?: string;
  attachmentTitle?: string;
  filePath?: string;
  mediaType?: string;
  mediaSize?: string;
  sourceId?: string;
  sourceName?: string;
  extraIdentifier?: string;
  createdAt?: string;
}
