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
  GET_MY_WASTE_WATER_PRODUCED_PAGEABLE,
  GET_OFFICER_WASTE_WATER_PRODUCED_PAGEABLE,
  GET_PLANT_MANAGER_WASTE_WATER_PRODUCED_PAGEABLE,
  GET_SHIFT_SUPERVISOR_WASTE_WATER_PRODUCED_PAGEABLE,
  GET_SUPERINTENDENT_WASTE_WATER_PRODUCED_PAGEABLE,
  GET_WASTE_WATER_PRODUCED_PAGEABLE,
} from './waste-water-produced.graphql';
import {
  wasteWaterProduced$,
  wasteWaterProducedTableBtns,
  wasteWaterProducedUpsertBtn,
} from './waste-water-produced.form';

@Component({
  selector: 'app-waste-water-produceds',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class WasteWaterProducedsComponent extends BaseComponent {
  override title = 'Waste Water Produced Management';
  override subtitle = 'Waste Water Produced List';
  override actionButtons: ActionButton[] = [wasteWaterProducedUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    actionButtons: wasteWaterProducedTableBtns(this),
    reloadActions$: [wasteWaterProduced$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents[StageEnum.OFFICER],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_OFFICER'],
      fetchParameter: { query: GET_OFFICER_WASTE_WATER_PRODUCED_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SHIFT_SUPERVISOR],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_SHIFT_SUPERVISOR'],
      fetchParameter: { query: GET_SHIFT_SUPERVISOR_WASTE_WATER_PRODUCED_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.SUPERINTENDENT],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_SUPERINTENDENT'],
      fetchParameter: { query: GET_SUPERINTENDENT_WASTE_WATER_PRODUCED_PAGEABLE },
    },
    {
      ...PlantReportContents[StageEnum.PLANT_MANAGER],
      permissions: ['ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_PLANT_MANAGER'],
      fetchParameter: { query: GET_PLANT_MANAGER_WASTE_WATER_PRODUCED_PAGEABLE },
    },
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_CREATE_WASTE_WATER_PRODUCED'],
      fetchParameter: { query: GET_MY_WASTE_WATER_PRODUCED_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_WASTE_WATER_PRODUCED'],
      fetchParameter: { query: GET_WASTE_WATER_PRODUCED_PAGEABLE },
    },
  ].map((c) => mapPlantListContent(this, { ...c, ...this.cp }));
}
