import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_BILLS_PAGEABLE } from './bill.graphql';
import { bill$, billViewBtn, raiseBillBtn } from './bill.form';

/**
 * Every bill raised. A bill is created only through the raise form, which writes
 * it with its lines and total in one transaction, so there is no add button here
 * beyond the one that opens that form.
 */
@Component({
  selector: 'app-bills',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class BillsComponent extends BaseComponent {
  override title = 'Bills';
  override subtitle = 'Bills raised against payers on the register';
  override actionButtons: ActionButton[] = [raiseBillBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber as Bill Id',
    'name',
    'tinData.assignedNumber as TIN',
    'currency.name as Currency',
    'billHeader.name as Header',
    { field: 'generatedAt', header: 'Generated' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Bills',
    icon: 'bill',
    keyColumns: this.keyColumns,
    isPageable: true,
    actionButtons: [billViewBtn(this)],
    reloadActions$: [bill$],
    fetchParameter: { query: ALL_BILLS_PAGEABLE },
  };
}
