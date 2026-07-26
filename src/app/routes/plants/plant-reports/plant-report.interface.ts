import { BaseEntity } from '@shared/components/details/util/util.interface';
import { Plant } from '../plants/plant.interface';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { User } from '@routes/auth/auth.interface';
import { PlantDailyReportStage, StageEnum } from '../hse-reports/hse-report.interface';

/** The aggregated, per-plant, per-day report that carries every other plant
 * report (HSE, condensate storage tank, etc.) through one shared approval
 * flow - see PlantDailyReportStage for what each stage nests. */
export interface PlantReport extends BaseEntity {
  approvalStatus: ApprovalStatus;
  createdBy: User;
  name: string;
  plant: Plant;
  stage: StageEnum;
  stages: PlantDailyReportStage[];
}
