import { SecurityActionPriority, SecurityActionStatus } from '../shared/security.enums';

export interface SecurityActionItem {
  id?: number;
  uid?: string;
  observationReported?: string;
  specificLocation?: string;
  priority?: SecurityActionPriority;
  controlMeasures?: string;
  responsibleName?: string;
  responsibleUser?: { uid?: string; fullName?: string };
  initiationDate?: string;
  closedDate?: string;
  status?: SecurityActionStatus;
  remarks?: string;
  sourceType?: string;
  sourceUid?: string;
  station?: { uid?: string; name?: string };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityActionItemDtoInput {
  uid?: string;
  observationReported?: string;
  specificLocation?: string;
  stationUid?: string;
  priority?: SecurityActionPriority;
  controlMeasures?: string;
  responsibleName?: string;
  responsibleUserUid?: string;
  initiationDate?: string;
  closedDate?: string;
  status?: SecurityActionStatus;
  remarks?: string;
  sourceType?: string;
  sourceUid?: string;
}
