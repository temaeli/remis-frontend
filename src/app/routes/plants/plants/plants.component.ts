import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ALL_PLANT_PAGEABLE } from './plant.graphql';
import { plantUpsertBtn } from './plant.form';
import { plantTableBtns, plant$ } from './plant.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-plants',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PlantsComponent extends BaseComponent {
  override title = 'Plants Management';
  override subtitle = 'Plants List';
  override actionButtons: ActionButton[] = [plantUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'code',
    'blockNumber',
    'supervisorUser.fullName as Supervisor',
    'dailyProductionCapacityMmscfd',
    'maximumCapacityMmscfd',
    // 'physicalAddress',
    // 'postalAddress',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: plantTableBtns(this),
    reloadActions$: [plant$],
    fetchParameter: { query: ALL_PLANT_PAGEABLE },
  };
}
