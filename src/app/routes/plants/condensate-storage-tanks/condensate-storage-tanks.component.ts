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
  GET_CONDENSATE_STORAGE_TANKS_PAGEABLE,
  GET_MY_CONDENSATE_STORAGE_TANK_PAGEABLE,
  GET_OFFICER_CONDENSATE_STORAGE_TANKS_PAGEABLE,
  GET_PLANT_MANAGER_CONDENSATE_STORAGE_TANKS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_CONDENSATE_STORAGE_TANKS_PAGEABLE,
  GET_SUPERINTENDENT_CONDENSATE_STORAGE_TANKS_PAGEABLE,
} from './condensate-storage-tank.graphql';
import {
  condensateStorageTank$,
  condensateStorageTankTableBtns,
  condensateStorageTankUpsertBtn,
} from './condensate-storage-tank.form';

@Component({
  selector: 'app-condensate-storage-tanks',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class CondensateStorageTanksComponent extends BaseComponent {
  override title = 'Condensate Storage Tank Management';
  override subtitle = 'Condensate Storage Tank List';
  override actionButtons: ActionButton[] = [condensateStorageTankUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: condensateStorageTankTableBtns(this),
    reloadActions$: [condensateStorageTank$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_CONDENSATE_STORAGE_TANKS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_CONDENSATE_STORAGE_TANKS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_CONDENSATE_STORAGE_TANKS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_CONDENSATE_STORAGE_TANKS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_CONDENSATE_STORAGE_TANK'],
      fetchParameter: { query: GET_MY_CONDENSATE_STORAGE_TANK_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_CONDENSATE_STORAGE_TANK'],
      fetchParameter: { query: GET_CONDENSATE_STORAGE_TANKS_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
