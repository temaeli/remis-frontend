import { Component } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';
import {
  GET_EXPORT_GAS_ANALYSIS_PAGEABLE,
  GET_MY_EXPORT_GAS_ANALYSIS_PAGEABLE,
  GET_OFFICER_EXPORT_GAS_ANALYSIS_PAGEABLE,
  GET_PLANT_MANAGER_EXPORT_GAS_ANALYSIS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_EXPORT_GAS_ANALYSIS_PAGEABLE,
  GET_SUPERINTENDENT_EXPORT_GAS_ANALYSIS_PAGEABLE,
} from './export-gas-analysis.graphql';
import {
  exportGasAnalysis$,
  exportGasAnalysisTableBtns,
  exportGasAnalysisUpsertBtn,
} from './export-gas-analysis.form';

@Component({
  selector: 'app-export-gas-analyses',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class ExportGasAnalysesComponent extends BaseComponent {
  override title = 'Export Gas Analysis Management';
  override subtitle = 'Export Gas Analysis List';
  override actionButtons: ActionButton[] = [exportGasAnalysisUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: exportGasAnalysisTableBtns(this),
    reloadActions$: [exportGasAnalysis$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_EXPORT_GAS_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_EXPORT_GAS_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_EXPORT_GAS_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_EXPORT_GAS_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_EXPORT_GAS_ANALYSIS'],
      fetchParameter: { query: GET_MY_EXPORT_GAS_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_EXPORT_GAS_ANALYSIS'],
      fetchParameter: { query: GET_EXPORT_GAS_ANALYSIS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
