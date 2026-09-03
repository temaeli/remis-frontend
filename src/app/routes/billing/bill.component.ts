import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { BILL_AMOUNT_OF_BILL, BILL_ITEMS_OF_BILL, FIND_BILL } from './bill.graphql';
import { GEPG_TRAIL_OF_BILL_HEADER } from './bill-gepg.graphql';
import { PAYMENTS_OF_BILL_HEADER } from './payment.graphql';
import { PAYMENT_VIEW_PERMISSIONS, paymentViewBtnFrom } from './payment.form';
import { gepgActionButtons, reuseControlNumberBtn } from './bill-gepg.actions';

/**
 * One bill: its own fields, the lines it is made of, and what it comes to.
 *
 * The bill itself is read-only. Its amounts are derived from its lines, and its
 * lines from their fee and rates, so there is nothing here to edit directly — a
 * correction is a new bill.
 *
 * What the header buttons change is not the bill but what GePG knows about it:
 * asking for a control number, reusing one, extending the expiry date, or
 * cancelling. They act on `billHeader`, which is what GePG issues a number
 * against. See `bill-gepg.actions`.
 */
@Component({
  selector: 'app-bill',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [data]="bill"
        [actionButtons]="gepgActions"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class BillComponent extends BaseComponent implements OnInit {
  override title = 'Bill';
  override subtitle = 'Bill details, its items and its total';

  bill: any;
  billUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  /**
   * Built once and kept, rather than recomputed in the template: each button
   * closes over this component, and the header re-reads the array on every
   * change detection pass.
   */
  gepgActions = gepgActionButtons(this);

  override contents: ContentParameter[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_BILL,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.billUid },
  };

  /**
   * What has been paid against this bill.
   *
   * Keyed on the bill's header rather than the bill itself: GePG reports a
   * payment against payment_headers.bill_headers_id, and a header can carry more
   * than one bill, so this is every payment raised under the same header. Close
   * enough to be the answer someone looking at a bill wants, and the only link
   * the schema actually provides.
   */
  paymentColumns: GridKeyColumn[] = [
    'index',
    'customerControlNumber as Control Number',
    'grpBillId as Group Bill Id',
    'entryCount as Transactions',
    { field: 'createdAt', header: 'Received' },
    'actions',
  ];

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

  /** Re-reads the bill after a GePG action, which changes its status but not its fields. */
  reload(): void {
    void this.ngOnInit();
  }

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
        type: 'table',
        name: 'Payments',
        label: 'Payments',
        icon: 'coins',
        permissions: PAYMENT_VIEW_PERMISSIONS,
        keyColumns: this.paymentColumns,
        actionButtons: [paymentViewBtnFrom(this)],
        fetchParameter: {
          query: PAYMENTS_OF_BILL_HEADER,
          variables: { billHeaderUid: this.bill?.billHeader?.id },
        },
      },
      ...this.gepgFlowTabs(),
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

  /**
   * What the trail rows show. `payload` is deliberately absent: a signed GePG
   * body is thousands of characters and would make every row unreadable — it is
   * on the record it came from, for anyone who needs it.
   */
  trailColumns: GridKeyColumn[] = [
    'index',
    { field: 'occurredAt', header: 'When' },
    { field: 'step', header: 'Step' },
    { field: 'reference', header: 'Reference' },
    { field: 'summary', header: 'What Happened' },
  ];

  /**
   * One tab per GePG conversation, each showing that flow's reason, request,
   * acknowledgement and response in the order they happened.
   *
   * Four tabs rather than one per table: the fourteen tables behind these are
   * the schema's shape, not a reader's. Someone looking at a bill asks what
   * happened when we cancelled it, not which of three tables holds the answer.
   *
   * Reuse carries its own button, since that is where someone stands when they
   * decide to reuse a number. Requesting, extending and cancelling stay on the
   * page header.
   */
  private gepgFlowTabs(): ContentParameter[] {
    const headerUid = this.bill?.billHeader?.id;
    const tab = (
      name: string,
      icon: string,
      flow: string,
      actionButtons?: any[],
    ): ContentParameter => ({
      type: 'table',
      name,
      label: name,
      icon,
      keyColumns: this.trailColumns,
      actionButtons,
      noContentLabel: 'Nothing has passed between this bill and GePG here yet',
      fetchParameter: {
        query: GEPG_TRAIL_OF_BILL_HEADER,
        variables: { billHeaderUid: headerUid, flow },
      },
    });

    return [
      tab('Control Number', 'numbers', 'CONTROL_NUMBER'),
      tab('Reuse', 'loop_alt', 'CONTROL_NUMBER_REUSE', [reuseControlNumberBtn(this)]),
      tab('Expiry Change', 'changebill', 'BILL_CHANGE'),
      tab('Cancellation', 'cancel', 'CANCELLATION'),
    ];
  }
}
