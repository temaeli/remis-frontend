import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS, MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_POWER_GENERATOR_TANKS } from './tank.graphql';

@Component({
  selector: 'fuel-management',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class FuelManagement extends BaseComponent {
  override title = 'Fuel Management';
  override subtitle = 'View fuel tanks across all working stations';

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    { field: 'workingStation.name', header: 'Working Station' },
    'capacityInLitres',
    'minimumVolume',
    { field: 'createdAt', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Fuel Management',
    icon: 'natural_gas',
    keyColumns: this.keyColumns,
    actionButtons: [
      {
        ...MORE_BTN,
        buttons: [
          {
            icon: 'view',
            label: 'View Tank',
            permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK'],
            click: (row: any) => navigateRelativeTo(this, 'fuel-management', row?.uid),
          },
        ],
      },
    ] as ActionButton[],
    fetchParameter: { query: GET_ALL_POWER_GENERATOR_TANKS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    hasActionsColumn: true,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'fuel-management', data.uid),
      },
    ],
  };
}
