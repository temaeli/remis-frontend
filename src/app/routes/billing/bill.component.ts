import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { BILL_AMOUNT_OF_BILL, BILL_ITEMS_OF_BILL, FIND_BILL } from './bill.graphql';

/**
 * One bill: its own fields, the lines it is made of, and what it comes to.
 *
 * Read-only. A bill's amounts are derived from its lines, and its lines from
 * their fee and rates, so there is nothing here to edit directly — a correction
 * is a new bill.
 */
@Component({
  selector: 'app-bill',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header [title]="title" [subtitle]="subtitle" [data]="bill" />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class BillComponent extends BaseComponent implements OnInit {
  override title = 'Bill';
  override subtitle = 'Bill details, its items and its total';

  bill: any;
  billUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_BILL,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.billUid },
  };

  itemColumns: GridKeyColumn[] = [
    'index',
    'name',
    'fee.name as Fee',
    'quantities as Qty',
    { field: 'billItemAmt', header: 'Amount' },
    'vat.vat as VAT Rate',
    'discount.discounts as Discount Rate',
    'withholdingTax.withholdingTax as WHT Rate',
    { field: 'finalBillItemAmt', header: 'Final Amount' },
    { field: 'finalBillItemEqvAmt', header: 'Final Equivalent' },
  ];

  async ngOnInit(): Promise<void> {
    const response = await this.fs.fetch(this.fetchParameter);
    this.bill = response?.data ?? response;

    // The total is a separate record, absent until the bill has a line.
    const total = await this.fs.fetch({
      query: BILL_AMOUNT_OF_BILL,
      showLoading: false,
      variables: { billDetailUid: this.billUid },
    });

    this.contents = [
      {
        type: 'details',
        name: 'Bill Details',
        label: 'Bill Details',
        icon: 'bill',
        showUndefined: true,
        entity: this.bill,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Bill Items',
        label: 'Bill Items',
        icon: 'list',
        keyColumns: this.itemColumns,
        fetchParameter: {
          query: BILL_ITEMS_OF_BILL,
          variables: { billDetailUid: this.billUid },
        },
      },
      {
        type: 'details',
        name: 'Billed Amount',
        label: 'Billed Amount',
        icon: 'coins',
        showUndefined: true,
        entity: total
          ? { billedAmount: total.billAmt, equivalentBilledAmount: total.billEqvAmt }
          : { billedAmount: 'Not yet totalled', equivalentBilledAmount: '—' },
      },
    ];

    this.cdr.detectChanges();
  }
}
