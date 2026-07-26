import { WasteCategory } from '../waste-categories/waste-category.interface';

export interface WasteGenerationLog {
  uid?: string;
  wasteCategory?: WasteCategory;
  wasteCategoryUid?: string;
  workingStationUid?: string;
  date?: string;
  amountGenerated?: number;
  amountRecycled?: number;
  remarks?: string;
  comment?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}
