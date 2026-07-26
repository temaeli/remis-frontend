import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_PLANT_WATER_READING_PAGEABLE } from './plant-water-reading.graphql';
import { plantWaterReadingUpsertBtn } from './plant-water-reading.form';
import { plantWaterReadingTableBtns, plantWaterReading$ } from './plant-water-reading.form';

@Component({
  selector: 'app-plant-water-readings',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PlantWaterReadingsComponent extends BaseComponent {
  override title = 'Plant Water Readings Management';
  override subtitle = 'Plant Water Readings List';
  override actionButtons: ActionButton[] = [plantWaterReadingUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'plant',
    'producedCondensate',
    'producedWater',
    'waterDewPoint',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: plantWaterReadingTableBtns(this),
    reloadActions$: [plantWaterReading$],
    fetchParameter: { query: ALL_PLANT_WATER_READING_PAGEABLE },
  };
}
