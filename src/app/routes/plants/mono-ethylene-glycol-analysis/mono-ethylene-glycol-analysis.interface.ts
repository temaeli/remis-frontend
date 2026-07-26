import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { BaseEntity } from '@shared/components/details/util/util.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';
import { PlantFormItem } from '../plant-form-items/plant-form-item.interface';
import { Plant } from '../plants/plant.interface';

export interface MonoEthyleneGlycolAnalysis extends BaseEntity {
  approvalStatus: ApprovalStatus;
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages?: PlantDailyReportStage[];
}

export interface MonoEthyleneGlycolAnalysisItem extends BaseEntity {
  concentration: number;
  item: PlantFormItem;
  monoEthyleneGlycolAnalysis: MonoEthyleneGlycolAnalysis;
  ph: number;
}

export interface MegaInputFormDtoInput {
  concentration: number;
  itemUid: string;
  ph: number;
}
