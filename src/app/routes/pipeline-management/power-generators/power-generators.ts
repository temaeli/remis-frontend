import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_POWER_GENERATORS } from './power-generator.graphql';
import { powerGeneratorViewBtn } from './power-generator.form';

@Component({
  selector: 'power-generators',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PowerGenerators extends BaseComponent {
  override title = 'Generator Management';
  override subtitle = 'View standby generators across all working stations';

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
    title: 'Generator Management',
    icon: 'flash',
    keyColumns: this.keyColumns,
    actionButtons: [powerGeneratorViewBtn(this)].filter(Boolean) as ActionButton[],
    fetchParameter: { query: GET_ALL_POWER_GENERATORS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'standby-generators', data.uid),
      },
    ],
  };
}
