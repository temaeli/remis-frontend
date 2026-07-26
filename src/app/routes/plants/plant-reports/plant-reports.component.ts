import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { StageEnum } from '../hse-reports/hse-report.interface';
import {
  mapPlantListContent,
  PlantReportContents,
  processReport$,
} from '../common-plant-reports/comon-plant-report';
import {
  GET_PLANT_MANAGER_PLANT_REPORTS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_PLANT_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_PLANT_REPORTS_PAGEABLE,
} from './plant-report.graphql';
import { plantReport$, plantReportInitializeBtn, plantReportTableBtns } from './plant-report.form';

@Component({
  selector: 'app-plant-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class PlantReportsComponent extends BaseComponent {
  override title = 'Plant Reports Management';
  override subtitle = 'Aggregated Plant Reports List';
  override actionButtons: ActionButton[] = [plantReportInitializeBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: plantReportTableBtns(this),
    reloadActions$: [plantReport$, processReport$],
    keyColumns: [
      'sno as S/No',
      'name as Report Name',
      'plant.name as Plant',
      'reportDate type(date)',
      'stage as Stage',
      'approvalStatus as Approval Status',
      'actions',
    ],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_PLANT_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_PLANT_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_PLANT_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_PLANT_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_PLANT_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_PLANT_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
