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
  GET_MY_POTABLE_WATER_PRODUCTION_PAGEABLE,
  GET_OFFICER_POTABLE_WATER_PRODUCTION_PAGEABLE,
  GET_PLANT_MANAGER_POTABLE_WATER_PRODUCTION_PAGEABLE,
  GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_POTABLE_WATER_PRODUCTION_PAGEABLE,
  GET_SUPERINTENDENT_POTABLE_WATER_PRODUCTION_PAGEABLE,
} from './potable-water-production.graphql';
import {
  potableWaterProduction$,
  potableWaterProductionTableBtns,
  potableWaterProductionUpsertBtn,
} from './potable-water-production.form';

@Component({
  selector: 'app-potable-water-productions',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class PotableWaterProductionsComponent extends BaseComponent {
  override title = 'Potable Water Production Management';
  override subtitle = 'Potable Water Production List';
  override actionButtons: ActionButton[] = [potableWaterProductionUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: potableWaterProductionTableBtns(this),
    reloadActions$: [potableWaterProduction$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_POTABLE_WATER_PRODUCTION_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_POTABLE_WATER_PRODUCTION_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_POTABLE_WATER_PRODUCTION_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_POTABLE_WATER_PRODUCTION_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_POTABLE_WATER_PRODUCTION'],
      fetchParameter: { query: GET_MY_POTABLE_WATER_PRODUCTION_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_POTABLE_WATER_PRODUCTION'],
      fetchParameter: { query: GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
