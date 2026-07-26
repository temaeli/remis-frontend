import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_EQUIPMENT_REFUELS } from './refuel.graphql';
import { refuelUpsertBtn, refuelTableBtns, powerGeneratorRefuel$ } from './refuel.form';
import { ProcessStatus, processStatusFromTimestamps } from '@shared/crud';

@Component({
  selector: 'equipment-refuels',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PowerGeneratorRefuels extends BaseComponent {
  override title = 'Equipment Refuels';
  override subtitle = 'All equipment refuelling activity';
  override actionButtons: ActionButton[] = [refuelUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'powerGenerator.name', header: 'Generator' },
    { field: 'generatorTank.name', header: 'Tank' },
    { field: 'date', type: 'date' },
    { field: 'quantityInLitres', valueFn: (row: any) => Number(row?.quantityInLitres ?? 0).toFixed(2) },
    'newVolume',
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
    title: 'Equipment Refuels',
    icon: 'natural_gas',
    keyColumns: this.keyColumns,
    actionButtons: refuelTableBtns(this),
    reloadActions$: [powerGeneratorRefuel$],
    fetchParameter: { query: GET_ALL_EQUIPMENT_REFUELS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) =>
          navigateRelativeTo(this, 'equipment-refuels', data.uid),
      },
    ],
  };
}
