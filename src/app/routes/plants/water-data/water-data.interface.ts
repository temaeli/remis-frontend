import { User } from '@routes/auth/auth.interface';
import { Plant } from '@routes/plants/plants/plant.interface';

export enum WaterDataType {
  DEW_POINT = 'DEW_POINT',
  HYDROCARBON = 'HYDROCARBON',
  WATER_CONTENT = 'WATER_CONTENT',
}

export const WaterDataTypeLabels: Record<WaterDataType, string> = {
  [WaterDataType.DEW_POINT]: 'Dew Point',
  [WaterDataType.HYDROCARBON]: 'Hydrocarbon',
  [WaterDataType.WATER_CONTENT]: 'Water Content',
};

/**
 * Maps each Water Data route slug to its WaterDataType. The list component is
 * shared across all three routes (see plants.routes.ts) and reads this off
 * `route.snapshot.routeConfig?.path` to know which type it's scoped to.
 */
export const WaterDataTypeBySlug: Record<string, WaterDataType> = {
  'water-data-dew-point': WaterDataType.DEW_POINT,
  'water-data-hydrocarbon': WaterDataType.HYDROCARBON,
  'water-data-water-content': WaterDataType.WATER_CONTENT,
};

export interface WaterData {
  active?: boolean;
  createdAt?: string;
  createdBy?: User;
  firstTrain?: number;
  plant?: Plant;
  secondTrain?: number;
  thirdTrain?: number;
  type?: WaterDataType;
  uid?: string;
  updatedAt?: string;
}

export interface WaterDataDtoInput {
  firstTrain?: number;
  secondTrain?: number;
  thirdTrain?: number;
  type: WaterDataType;
}
