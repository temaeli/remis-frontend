import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_ENERGY_USAGES } from './energy-usage.graphql';
import { energyUsageUpsertBtn, energyUsageViewBtn, energyUsage$ } from './energy-usage.form';

@Component({
  selector: 'energy-usages',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class EnergyUsages extends BaseComponent {
  override title = 'Energy Usages';
  override subtitle = 'Daily energy consumption records';
  override actionButtons: ActionButton[] = [energyUsageUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'energyUse.name', header: 'Energy Use' },
    { field: 'workingStation.name', header: 'Station' },
    { field: 'date', type: 'date', header: 'Month' },
    { field: 'amountUsed', header: 'Amount Used' },
    { field: 'unitOfMeasure', header: 'Unit' },
    { field: 'submittedAt', type: 'dateTime', header: 'Submitted' },
    { field: 'approvedAt', type: 'dateTime', header: 'Approved' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Energy Usages',
    icon: 'flash',
    keyColumns: this.keyColumns,
    actionButtons: [energyUsageViewBtn(this)],
    reloadActions$: [energyUsage$],
    fetchParameter: { query: GET_ALL_ENERGY_USAGES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'energy-usages', data.uid),
      },
    ],
  };
}
