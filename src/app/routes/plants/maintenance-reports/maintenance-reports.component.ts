import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { maintenanceReportUpsertBtn } from './maintenance-report.form';
import { maintenanceReportTableBtns, maintenanceReport$ } from './maintenance-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GET_MAINTENANCE_REPORTS_PAGEABLE,
  GET_MY_MAINTENANCE_REPORTS_PAGEABLE,
  GET_OFFICER_MAINTENANCE_REPORTS_PAGEABLE,
  GET_PLANT_MANAGER_MAINTENANCE_REPORTS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_MAINTENANCE_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_MAINTENANCE_REPORTS_PAGEABLE,
} from './maintenance-report.graphql';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';

@Component({
  selector: 'app-maintenance-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class MaintenanceReportsComponent extends BaseComponent {
  override title = 'Maintenance Reports Management';
  override subtitle = 'Maintenance Reports List';
  override actionButtons: ActionButton[] = [maintenanceReportUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: maintenanceReportTableBtns(this),
    reloadActions$: [maintenanceReport$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_MAINTENANCE_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_MAINTENANCE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_MAINTENANCE_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_MAINTENANCE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_MAINTENANCE_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_MAINTENANCE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_MAINTENANCE_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_MAINTENANCE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_MAINTENANCE_REPORT'],
      fetchParameter: { query: GET_MY_MAINTENANCE_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_MAINTENANCE_REPORT'],
      fetchParameter: { query: GET_MAINTENANCE_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
