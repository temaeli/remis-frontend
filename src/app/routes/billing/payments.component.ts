import { Component } from '@angular/core';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_PAYMENTS_PAGEABLE } from './payment.graphql';
import { payment$, paymentViewBtn } from './payment.form';

/**
 * Every payment GePG has reported.
 *
 * No add button. These rows arrive on a callback rather than being typed, and
 * their amounts are derived from the bill behind them — a payment that
 * disagrees with its bill is something to investigate, not something to correct
 * here.
 */
@Component({
  selector: 'app-payments',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PaymentsComponent extends BaseComponent {
  override title = 'Payments';
  override subtitle = 'Payments reported by GePG against bills on the register';

  keyColumns: GridKeyColumn[] = [
    'index',
    'customerControlNumber as Control Number',
    'reqId as Request Id',
    'grpBillId as Group Bill Id',
    'billHeader.name as Bill Header',
    'entryCount as Transactions',
    { field: 'createdAt', header: 'Received' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Payments',
    icon: 'coins',
    keyColumns: this.keyColumns,
    isPageable: true,
    actionButtons: [paymentViewBtn(this)],
    reloadActions$: [payment$],
    fetchParameter: { query: ALL_PAYMENTS_PAGEABLE },
  };
}
