import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';

export interface DailyReportColumn {
  key: string;
  label: string;
}

/** One row-group section backed by a PlantFormGroup/PlantFormItem pair (e.g. Fuel & Flared Gas). */
export interface DailyReportItemSectionConfig {
  title: string;
  inputType: PlantInputType;
  pageableQuery: unknown;
  itemsQuery: unknown;
  itemsVarKey: 'formUid' | 'reportUid';
  columns: DailyReportColumn[];
}

export interface DailyReportRow {
  itemUid?: string;
  name: string;
  unit?: string;
  [key: string]: unknown;
}

export interface DailyReportSectionResult {
  title: string;
  columns: DailyReportColumn[];
  rows: DailyReportRow[];
  reportDate?: string;
  hasReport: boolean;
}
