import { EnergyUse } from '../energy-uses/energy-use.interface';

export interface EnergyUsage {
  uid?: string;
  energyUse?: EnergyUse;
  energyUseUid?: string;
  workingStationUid?: string;
  date?: string;
  amountUsed?: number;
  unitOfMeasure?: string;
  remarks?: string;
  comment?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}
