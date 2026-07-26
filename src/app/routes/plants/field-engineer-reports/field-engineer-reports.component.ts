import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { fieldEngineerReportUpsertBtn } from './field-engineer-report.form';
import { fieldEngineerReportTableBtns, fieldEngineerReport$ } from './field-engineer-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GET_FIELD_REPORTS_PAGEABLE,
  GET_MY_FIELD_ENGINEER_REPORTS_PAGEABLE,
  GET_OFFICER_FIELD_ENGINEER_REPORTS_PAGEABLE,
  GET_PLANT_MANAGER_FIELD_ENGINEER_REPORTS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_FIELD_ENGINEER_REPORTS_PAGEABLE,
  GET_SUPERINTENDENT_FIELD_ENGINEER_REPORTS_PAGEABLE,
} from './field-engineer-report.graphql';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { StageEnum } from '../hse-reports/hse-report.interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

@Component({
  selector: 'app-field-engineer-reports',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class FieldEngineerReportsComponent extends BaseComponent {
  override title = 'Field Engineer Reports Management';
  override subtitle = 'Field Engineer Reports List';
  override actionButtons: ActionButton[] = [fieldEngineerReportUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: fieldEngineerReportTableBtns(this),
    reloadActions$: [fieldEngineerReport$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_FIELD_ENGINEER_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_FIELD_ENGINEER_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_FIELD_ENGINEER_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_FIELD_ENGINEER_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_FE_REPORT'],
      fetchParameter: { query: GET_MY_FIELD_ENGINEER_REPORTS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_FE_REPORT'],
      fetchParameter: { query: GET_FIELD_REPORTS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
