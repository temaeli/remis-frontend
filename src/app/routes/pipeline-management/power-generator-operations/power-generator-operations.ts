import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_POWER_GENERATOR_OPERATIONS } from './operation.graphql';
import {
  operationUpsertBtn,
  operationTableBtns,
  powerGeneratorOperation$,
} from './operation.form';
import { ProcessStatus, processStatusFromTimestamps } from '@shared/crud';

@Component({
  selector: 'power-generator-operations',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PowerGeneratorOperations extends BaseComponent {
  override title = 'Standby Generator Operations';
  override subtitle = 'All operations across generators';
  override actionButtons: ActionButton[] = [operationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'powerGenerator.name', header: 'Generator' },
    { field: 'date', type: 'date' },
    'fuelLevel',
    'fuelConsumed',
    { field: 'accumulatedRunHours', header: 'Total Running Hours' },
    { field: 'runHours', header: 'Hours This Run' },
    {
      field: 'status',
      header: 'Approval Status',
      valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
      valueClassMapper: (row: any) => {
        const s = processStatusFromTimestamps(row);
        if (s === ProcessStatus.APPROVED) return 'text-success';
        if (s === ProcessStatus.SUBMITTED) return 'text-primary';
        if (s === ProcessStatus.DRAFT) return 'text-warning';
        if (s === ProcessStatus.REJECTED) return 'text-danger';
        return '';
      },
    },
    { field: 'createdAt', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Standby Generator Operations',
    icon: 'flash',
    keyColumns: this.keyColumns,
    actionButtons: operationTableBtns(this),
    reloadActions$: [powerGeneratorOperation$],
    fetchParameter: { query: GET_ALL_POWER_GENERATOR_OPERATIONS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) =>
          navigateRelativeTo(this, 'power-generator-operations', data.uid),
      },
    ],
  };
}
