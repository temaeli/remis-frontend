import { EmissionSubstance } from '../emission-substances/emission-substance.interface';

export interface EmissionLog {
  uid?: string;
  emissionSubstance?: EmissionSubstance;
  emissionSubstanceUid?: string;
  workingStationUid?: string;
  date?: string;
  amountEmitted?: number;
  unitOfMeasure?: string;
  remarks?: string;
  comment?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}
