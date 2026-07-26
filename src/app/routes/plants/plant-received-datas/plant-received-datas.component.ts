import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_PLANT_PROCESSING_DATA_PAGEABLE } from './plant-received-data.graphql';
import { plantReceivedDataUpsertBtn } from './plant-received-data.form';
import { plantReceivedDataTableBtns, plantReceivedData$ } from './plant-received-data.form';

@Component({
  selector: 'app-plant-received-datas',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PlantReceivedDatasComponent extends BaseComponent {
  override title = 'Plant Received Data Management';
  override subtitle = 'Plant Received Data List';
  override actionButtons: ActionButton[] = [plantReceivedDataUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'plant',
    'client.user as Customer',
    'receivedRawGasVolume as Received Raw Gas Volume (m³)',
    'receivedRawGasPressure as Received Raw Gas Pressure (Pa)',
    'receivedRawGasTemperature as Received Raw Gas Temperature (°C)',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: plantReceivedDataTableBtns(this),
    reloadActions$: [plantReceivedData$],
    fetchParameter: { query: ALL_PLANT_PROCESSING_DATA_PAGEABLE },
  };
}
