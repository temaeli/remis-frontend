import { ManpowerCategory } from '../manpower-categories/manpower-category.interface';
import { WorkingStation } from '@routes/pipeline-management/working-stations/working-station.interface';

export interface WorkStationManHour {
  id?: number;
  uid?: string;
  manHours?: number;
  category?: ManpowerCategory;
  station?: WorkingStation;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkStationManHourDtoInput {
  uid?: string;
  manHours: number;
  manpowerCategoryUid: string;
  workingStationUid: string;
}
