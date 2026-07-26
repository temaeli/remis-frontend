import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS, MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_POWER_GENERATOR_TANKS } from './tank.graphql';
import { tankUpsertBtn, tankDeleteBtn, powerGeneratorTank$ } from './tank.form';

@Component({
  selector: 'fuel-tanks',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class FuelTanks extends BaseComponent {
  override title = 'Fuel Tanks';
  override subtitle = 'Manage Fuel Tanks';
  override actionButtons: ActionButton[] = [tankUpsertBtn(this)];

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
    title: 'Fuel Tanks',
    icon: 'natural_gas',
    keyColumns: this.keyColumns,
    actionButtons: [
      {
        ...MORE_BTN,
        buttons: [
          {
            icon: 'view',
            label: 'View Fuel Tank',
            permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK', 'ROLE_MANAGE_POWER_GENERATOR_TANK'],
            click: (row: any) => navigateRelativeTo(this, 'fuel-tanks', row?.uid),
          },
          tankUpsertBtn(this),
          tankDeleteBtn(this),
        ],
      },
    ] as ActionButton[],
    reloadActions$: [powerGeneratorTank$],
    fetchParameter: { query: GET_ALL_POWER_GENERATOR_TANKS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    hasActionsColumn: true,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'fuel-tanks', data.uid),
      },
    ],
  };
}
