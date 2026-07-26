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
  GET_MY_WATER_TANK_LEVEL_PAGEABLE,
  GET_OFFICER_WATER_TANK_LEVEL_PAGEABLE,
  GET_PLANT_MANAGER_WATER_TANK_LEVEL_PAGEABLE,
  GET_SHIFT_SUPERVISOR_WATER_TANK_LEVEL_PAGEABLE,
  GET_SUPERINTENDENT_WATER_TANK_LEVEL_PAGEABLE,
  GET_WATER_TANK_LEVELS_PAGEABLE,
} from './water-tank-level.graphql';
import {
  waterTankLevel$,
  waterTankLevelTableBtns,
  waterTankLevelUpsertBtn,
} from './water-tank-level.form';

@Component({
  selector: 'app-water-tank-levels',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class WaterTankLevelsComponent extends BaseComponent {
  override title = 'Water Tank Level Management';
  override subtitle = 'Water Tank Level List';
  override actionButtons: ActionButton[] = [waterTankLevelUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: waterTankLevelTableBtns(this),
    reloadActions$: [waterTankLevel$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_WATER_TANK_LEVEL_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_WATER_TANK_LEVEL_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_WATER_TANK_LEVEL_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_WATER_TANK_LEVEL_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_WATER_TANK_LEVEL_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_WATER_TANK_LEVEL_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_WATER_TANK_LEVEL_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_WATER_TANK_LEVEL_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_WATER_TANK_LEVEL'],
      fetchParameter: { query: GET_MY_WATER_TANK_LEVEL_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_WATER_TANK_LEVEL'],
      fetchParameter: { query: GET_WATER_TANK_LEVELS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
