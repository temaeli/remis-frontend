import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { unitSymbol } from '../shared/unit-of-measure';
import { GET_ALL_EMISSION_SUBSTANCES } from './emission-substance.graphql';
import {
  emissionSubstanceUpsertBtn,
  emissionSubstanceTableBtns,
  emissionSubstance$,
} from './emission-substance.form';

@Component({
  selector: 'emission-substances',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class EmissionSubstances extends BaseComponent {
  override title = 'Emission Substances';
  override subtitle = 'Manage Emission Substances';
  override actionButtons: ActionButton[] = [emissionSubstanceUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    { field: 'energyUse.name', header: 'Energy Use' },
    {
      field: 'unitOfMeasure',
      header: 'Unit',
      valueFn: (row: any) => unitSymbol(row?.unitOfMeasure),
    },
    {
      field: 'conversionFactor',
      header: 'Conversion Factor',
      valueFn: (row: any) => Number(row?.conversionFactor ?? 0).toFixed(4),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Emission Substances',
    icon: 'cloud_download',
    keyColumns: this.keyColumns,
    actionButtons: emissionSubstanceTableBtns(this),
    reloadActions$: [emissionSubstance$],
    fetchParameter: { query: GET_ALL_EMISSION_SUBSTANCES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'emission-substances', data.uid),
      },
    ],
  };
}
