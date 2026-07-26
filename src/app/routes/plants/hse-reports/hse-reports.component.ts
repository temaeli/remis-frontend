import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { hseReportUpsertBtn } from './hse-report.form';
import { hseReportTableBtns, hseReport$ } from './hse-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GET_MY_HSE_REPORTS_PAGEABLE,
  GET_OFFICER_HSE_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_HSE_REPORTS_PAGEABLE,
} from './hse-report.graphql';
import { GET_HSE_REPORTS_PAGEABLE } from './hse-report.graphql';
import { GET_PLANT_MANAGER_HSE_REPORTS_PAGEABLE } from './hse-report.graphql';
import { GET_SHIFT_SUPERVISOR_HSE_REPORTS_PAGEABLE } from './hse-report.graphql';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { StageEnum } from './hse-report.interface';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-hse-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class HseReportsComponent extends BaseComponent {
  override title = 'HSE Reports Management';
  override subtitle = 'HSE Reports List';
  override actionButtons: ActionButton[] = [hseReportUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: hseReportTableBtns(this),
    reloadActions$: [hseReport$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_HSE_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_HSE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_HSE_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_HSE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_HSE_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_HSE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_HSE_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_HSE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_HSE_REPORT'],
      fetchParameter: { query: GET_MY_HSE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_HSE_REPORT'],
      fetchParameter: { query: GET_HSE_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
