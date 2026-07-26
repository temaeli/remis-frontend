import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { securityReportUpsertBtn } from './security-report.form';
import { securityReportTableBtns, securityReport$ } from './security-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GET_MY_SECURITY_REPORTS_PAGEABLE,
  GET_OFFICER_SECURITY_REPORTS_PAGEABLE,
  GET_PLANT_MANAGER_SECURITY_REPORTS_PAGEABLE,
  GET_SECURITY_REPORTS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_SECURITY_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_SECURITY_REPORTS_PAGEABLE,
} from './security-report.graphql';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

@Component({
  selector: 'app-security-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class SecurityReportsComponent extends BaseComponent {
  override title = 'Security Reports Management';
  override subtitle = 'Security Reports List';
  override actionButtons: ActionButton[] = [securityReportUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: securityReportTableBtns(this),
    reloadActions$: [securityReport$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_SECURITY_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_SECURITY_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_SECURITY_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_SECURITY_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_SECURITY_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_SECURITY_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_SECURITY_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_SECURITY_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_SECURITY_REPORT'],
      fetchParameter: { query: GET_MY_SECURITY_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_SECURITY_REPORT'],
      fetchParameter: { query: GET_SECURITY_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
