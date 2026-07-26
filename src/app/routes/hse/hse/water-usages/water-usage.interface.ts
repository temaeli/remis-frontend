import { WaterUse } from '../water-uses/water-use.interface';

export interface WaterUsage {
  uid?: string;
  waterUse?: WaterUse;
  waterUseUid?: string;
  workingStationUid?: string;
  date?: string;
  meterReading?: number;
  amountUsed?: number;
  remarks?: string;
  comment?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}
