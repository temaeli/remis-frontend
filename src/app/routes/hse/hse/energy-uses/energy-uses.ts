import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { unitSymbol } from '../shared/unit-of-measure';
import { GET_ALL_ENERGY_USES } from './energy-use.graphql';
import { energyUseUpsertBtn, energyUseTableBtns, energyUse$ } from './energy-use.form';

@Component({
  selector: 'energy-uses',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class EnergyUses extends BaseComponent {
  override title = 'Energy Uses';
  override subtitle = 'Manage Energy Uses';
  override actionButtons: ActionButton[] = [energyUseUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    {
      field: 'unitOfMeasure',
      header: 'Unit',
      valueFn: (row: any) => unitSymbol(row?.unitOfMeasure),
    },
    'description',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Energy Uses',
    icon: 'flash',
    keyColumns: this.keyColumns,
    actionButtons: energyUseTableBtns(this),
    reloadActions$: [energyUse$],
    fetchParameter: { query: GET_ALL_ENERGY_USES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'energy-uses', data.uid),
      },
    ],
  };
}
