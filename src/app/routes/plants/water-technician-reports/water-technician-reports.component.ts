import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { waterTechnicianReportUpsertBtn } from './water-technician-report.form';
import {
  waterTechnicianReportTableBtns,
  waterTechnicianReport$,
} from './water-technician-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GET_MY_WATER_TECHNICIAN_REPORTS_PAGEABLE,
  GET_OFFICER_WATER_TECHNICIAN_REPORTS_PAGEABLE,
  GET_PLANT_MANAGER_WATER_TECHNICIAN_REPORTS_PAGEABLE,
  GET_WATER_TECHNICIAN_REPORTS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_WATER_TECHNICIAN_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_WATER_TECHNICIAN_REPORTS_PAGEABLE,
} from './water-technician-report.graphql';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

@Component({
  selector: 'app-water-technician-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class WaterTechnicianReportsComponent extends BaseComponent {
  override title = 'Water Technician Reports Management';
  override subtitle = 'Water Technician Reports List';
  override actionButtons: ActionButton[] = [waterTechnicianReportUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: waterTechnicianReportTableBtns(this),
    reloadActions$: [waterTechnicianReport$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_WATER_TECHNICIAN_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_WATER_TECHNICIAN_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_WATER_TECHNICIAN_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_WATER_TECHNICIAN_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_WATER_TECHNICIAN_REPORT'],
      fetchParameter: { query: GET_MY_WATER_TECHNICIAN_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_WATER_TECHNICIAN_REPORT', 'VIEW_ALL_WATER_TECHNICIAN_REPORT'], // to be removed after backend role name is fixed
      fetchParameter: { query: GET_WATER_TECHNICIAN_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
