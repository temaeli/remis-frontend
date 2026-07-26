import { Component } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  mapPlantListContent,
  PlantReportContents,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';
import {
  GET_MY_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  GET_OFFICER_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  GET_PLANT_MANAGER_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  GET_SUPERINTENDENT_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
} from './mono-ethylene-glycol-analysis.graphql';
import {
  monoEthyleneGlycolAnalysis$,
  monoEthyleneGlycolAnalysisTableBtns,
  monoEthyleneGlycolAnalysisUpsertBtn,
} from './mono-ethylene-glycol-analysis.form';

@Component({
  selector: 'app-mono-ethylene-glycol-analyses',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class MonoEthyleneGlycolAnalysesComponent extends BaseComponent {
  override title = 'Mono Ethylene Glycol Analysis Management';
  override subtitle = 'Mono Ethylene Glycol Analysis List';
  override actionButtons: ActionButton[] = [monoEthyleneGlycolAnalysisUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: monoEthyleneGlycolAnalysisTableBtns(this),
    reloadActions$: [monoEthyleneGlycolAnalysis$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SUPERINTENDENT'],
      fetchParameter: {
        query: GET_SUPERINTENDENT_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
      },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_PLANT_MANAGER'],
      fetchParameter: {
        query: GET_PLANT_MANAGER_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
      },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_MONO_ETHYLENE_ANALYSIS'],
      fetchParameter: { query: GET_MY_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_MONO_ETHYLENE_ANALYSIS'],
      fetchParameter: { query: GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
