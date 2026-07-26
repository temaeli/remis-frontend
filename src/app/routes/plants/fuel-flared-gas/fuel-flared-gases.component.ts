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
  GET_FUEL_FLARED_GASES_PAGEABLE,
  GET_MY_FUEL_FLARED_GAS_PAGEABLE,
  GET_OFFICER_FUEL_FLARED_GAS_PAGEABLE,
  GET_PLANT_MANAGER_FUEL_FLARED_GAS_PAGEABLE,
  GET_SHIFT_SUPERVISOR_FUEL_FLARED_GAS_PAGEABLE,
  GET_SUPERINTENDENT_FUEL_FLARED_GAS_PAGEABLE,
} from './fuel-flared-gas.graphql';
import {
  fuelFlaredGas$,
  fuelFlaredGasTableBtns,
  fuelFlaredGasUpsertBtn,
} from './fuel-flared-gas.form';

@Component({
  selector: 'app-fuel-flared-gases',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class FuelFlaredGasesComponent extends BaseComponent {
  override title = 'Fuel and Flared Gas Management';
  override subtitle = 'Fuel and Flared Gas List';
  override actionButtons: ActionButton[] = [fuelFlaredGasUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: fuelFlaredGasTableBtns(this),
    reloadActions$: [fuelFlaredGas$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_FUEL_FLARED_GAS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_FUEL_FLARED_GAS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_FUEL_FLARED_GAS_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_FUEL_FLARED_GAS_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_FUEL_AND_FLARED_GAS'],
      fetchParameter: { query: GET_MY_FUEL_FLARED_GAS_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_FUEL_AND_FLARED_GAS'],
      fetchParameter: { query: GET_FUEL_FLARED_GASES_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
