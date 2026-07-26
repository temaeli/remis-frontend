import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { powerReportUpsertBtn } from './power-report.form';
import { powerReportTableBtns, powerReport$ } from './power-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GET_MY_POWER_REPORTS_PAGEABLE,
  GET_OFFICER_POWER_GENERATION_REPORTS_PAGEABLE,
  GET_PLANT_MANAGER_POWER_GENERATION_REPORTS_PAGEABLE,
  GET_POWER_REPORTS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_POWER_GENERATION_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_POWER_GENERATION_REPORTS_PAGEABLE,
} from './power-report.graphql';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { StageEnum } from '../hse-reports/hse-report.interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

@Component({
  selector: 'app-power-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class PowerReportsComponent extends BaseComponent {
  override title = 'Power Generation Reports Management';
  override subtitle = 'Power Generation Reports List';
  override actionButtons: ActionButton[] = [powerReportUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: powerReportTableBtns(this),
    reloadActions$: [powerReport$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_POWER_GENERATION_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_POWER_GENERATION_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_POWER_GENERATION_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_POWER_GENERATION_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_POWER_GENERATION_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_POWER_GENERATION_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_POWER_GENERATION_REPORT'],
      fetchParameter: { query: GET_MY_POWER_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_POWER_GENERATION_REPORT'],
      fetchParameter: { query: GET_POWER_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
