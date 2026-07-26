import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_POWER_GENERATORS } from './power-generator.graphql';
import {
  powerGeneratorUpsertBtn,
  powerGeneratorDeleteBtn,
  powerGenerator$,
} from './power-generator.form';

@Component({
  selector: 'power-generators-config',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PowerGeneratorsConfig extends BaseComponent {
  override title = 'Standby Generators';
  override subtitle = 'Configure standby generators (create, edit, delete)';
  override actionButtons: ActionButton[] = [powerGeneratorUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    {
      field: 'workStation.name',
      header: 'Working Station',
    },
    'capacityKva',
    { field: 'status', header: 'Generator Status' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Standby Generators',
    icon: 'flash',
    keyColumns: this.keyColumns,
    actionButtons: [
      {
        ...MORE_BTN,
        buttons: [
          {
            icon: 'view',
            label: 'View Generator',
            permissions: ['ROLE_VIEW_POWER_GENERATOR', 'ROLE_MANAGE_POWER_GENERATOR'],
            click: (row: any) =>
              navigateRelativeTo(this, 'standby-generators-config', row?.uid),
          },
          powerGeneratorUpsertBtn(this),
          powerGeneratorDeleteBtn(this),
        ],
      },
    ] as ActionButton[],
    reloadActions$: [powerGenerator$],
    fetchParameter: { query: GET_ALL_POWER_GENERATORS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'standby-generators-config', data.uid),
      },
    ],
  };
}
