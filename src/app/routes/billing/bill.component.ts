import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { Subject } from 'rxjs';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  ALL_BILL_ITEMS_TO_FOLLOW,
  BILL_AMOUNT_OF_BILL,
  BILL_ITEM_CONNECTIONS_OF_BILL,
  BILL_ITEMS_OF_BILL,
  BILL_PAPER,
  COLLECTION_ACCOUNTS_OF_BILL,
  CONTROL_NUMBER_OF_BILL,
  FIND_BILL,
  LINK_BILL_ITEM_CONNECTION,
  UNLINK_BILL_ITEM_CONNECTION,
} from './bill.graphql';
import { gepgFlowPanels } from './bill-gepg.panels';
import { childBillPanels, lineAmountPanels } from './bill-amounts.panels';
import { PAYMENTS_OF_BILL_HEADER } from './payment.graphql';
import { PAYMENT_VIEW_PERMISSIONS, paymentViewBtnFrom } from './payment.form';
import { gepgActionButtons, reuseControlNumberBtn } from './bill-gepg.actions';
import {
  BillPaper,
  CollectionAccount,
  howToPayHtml,
  printGovernmentBill,
  printTransferForm,
} from './bill-documents';

/** Printing a bill shows nothing the screen does not, so it is gated like viewing one. */
const BILL_PRINT_PERMISSIONS = ['ROLE_VIEW_ALL_BILL_DETAIL', 'ROLE_VIEW_BILL_DETAIL'];

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
  gepgActions: ActionButton[] = [...gepgActionButtons(this), ...this.paperButtons()];

  /** The control number this bill is paid on, once GePG has issued one. */
  private controlNumber: string | null = null;

  /** The institution's internal accounts in this bill's currency: where it is paid into. */
  private accounts: CollectionAccount[] = [];

  /** What the bill comes to, as its total record has it. */
  private billedAmount: number | null = null;

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

  /**
   * The earlier line each of this bill's lines follows, by the line's id: the
   * link's own uid, to unlink it by, and the earlier line's reference. Read once
   * beside the lines rather than per row. A line missing from it is a first
   * line.
   */
  private follows = new Map<string, { uid: string; reference: string }>();

  /**
   * Places a line under the line it follows — `bill_items_bill_items`. The
   * renewal run does this by itself; this is for a line it could not place, or
   * a bill raised by hand. Offered only on a line that follows nothing yet: the
   * backend refuses a second parent, and a line under itself or a loop.
   */
  private setFollowsBtn: ActionButton = {
    icon: 'add',
    label: 'Set Follows',
    showFunction: (row: any) => !this.follows.has(row?.id),
    click: (row: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: `Line ${row?.assignedNumber ?? ''} follows`,
        fields: [
          {
            key: 'parentUid',
            label: 'Earlier Bill Line',
            hint: 'The line this one follows, by its reference',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'assignedNumber',
              valueKey: 'id',
              fetchParameter: { query: ALL_BILL_ITEMS_TO_FOLLOW },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await this.fs.fetch({
            notify: true,
            variables: { parentUid: value?.parentUid, childUid: row?.id },
            mutation: LINK_BILL_ITEM_CONNECTION,
            successFn: () => {
              close$.next();
              this.reload();
            },
          });
        },
      };
      this.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ['ROLE_CREATE_BILL_ITEM_CONNECTION', 'ROLE_UPDATE_BILL_ITEM_CONNECTION'],
  };

  /** Removes the link outright, which makes the line a first line again. */
  private removeFollowsBtn: ActionButton = {
    icon: 'block',
    label: 'Remove Follows',
    class: 'text-danger',
    showFunction: (row: any) => this.follows.has(row?.id),
    confirmDataMapper: (row: any) => ({
      title: 'UNLINK',
      confirmText: 'UNLINK',
      confirmButtonColor: 'red',
      message: `Stop this line following <b class='text-danger'>${
        this.follows.get(row?.id)?.reference ?? ''
      }</b> ?`,
    }),
    click: async (row: any) => {
      await this.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: this.follows.get(row?.id)?.uid },
        mutation: UNLINK_BILL_ITEM_CONNECTION,
        successFn: () => this.reload(),
      });
    },
    permissions: ['ROLE_DELETE_BILL_ITEM_CONNECTION'],
  };

  itemColumns: GridKeyColumn[] = [
    'index',
    'name',
    {
      field: 'follows',
      header: 'Follows',
      valueFn: (row) => this.follows.get(row?.id)?.reference ?? 'First line',
    },
    'fee.name as Fee',
    'quantities as Qty',
    { field: 'billItemAmt', header: 'Amount' },
    'vat.vat as VAT Rate',
    'discount.discounts as Discount Rate',
    'withholdingTax.withholdingTax as WHT Rate',
    { field: 'finalBillItemAmt', header: 'Final Amount' },
    { field: 'finalBillItemEqvAmt', header: 'Final Equivalent' },
    'actions',
  ];

  /**
   * The two papers the GePG guide has an institution hand a payer: the
   * government bill, and the transfer form for one paying by TISS or SWIFT.
   * Neither is printed for a bill with no control number -- there would be
   * nothing on it to pay against.
   */
  private paperButtons(): ActionButton[] {
    return [
      {
        icon: 'bill',
        label: 'Print Bill',
        toolTip: 'Print the government bill, with how to pay it',
        permissions: BILL_PRINT_PERMISSIONS,
        click: async () => {
          const paper = await this.billPaper();
          if (paper) await printGovernmentBill(paper, this.printedBy());
        },
      },
      {
        icon: 'money_exchange',
        label: 'Print Transfer Form',
        toolTip: 'Print the form for paying this bill by bank transfer (TISS or SWIFT)',
        permissions: BILL_PRINT_PERMISSIONS,
        click: async () => {
          const paper = await this.billPaper();
          if (!paper) return;
          if (!paper.accounts.length) {
            this.notify.warn(
              `No internal bank account is kept in ${paper.currencyName || "this bill's currency"}, so there is no beneficiary to transfer to.`,
            );
            return;
          }
          await printTransferForm(paper, this.printedBy());
        },
      },
    ];
  }

  /** Printed and prepared by whoever is logged in, now. */
  private printedBy() {
    return { user: this.auth.user$.value?.name ?? '', at: new Date() };
  }

  /** Everything a printed bill carries, read fresh so the paper is not older than the screen. */
  private async billPaper(): Promise<BillPaper | null> {
    if (!this.controlNumber) {
      this.notify.warn('This bill has no control number yet, so there is nothing to pay against.');
      return null;
    }
    const response = await this.fs.fetch({
      query: BILL_PAPER,
      loadingOn: 'content',
      variables: { uid: this.billUid },
    });
    const bill = response?.data ?? response;
    const lines = await this.fs.fetch({
      query: BILL_ITEMS_OF_BILL,
      showLoading: false,
      variables: { billDetailUid: this.billUid },
    });
    const items = (Array.isArray(lines) ? lines : (lines?.data ?? [])).map((line: any) => ({
      description: [line?.gfsCode?.name, line?.name].filter(Boolean).join(' - '),
      amount: Number(line?.finalBillItemAmt ?? 0),
    }));

    return {
      institution: bill?.spCode?.name ?? '',
      controlNumber: this.controlNumber,
      paymentReference: bill?.assignedNumber ?? '',
      serviceProviderCode: bill?.spCode?.assignedNumber ?? '',
      payerName: bill?.bioData?.name ?? '',
      payerPhone: bill?.bioData?.mobileNumber != null ? `${bill.bioData.mobileNumber}` : '',
      description: bill?.description || bill?.name || '',
      items,
      // The bill's own total where it has one; its lines summed where it does not yet.
      total:
        this.billedAmount ??
        items.reduce((sum: number, line: { amount: number }) => sum + line.amount, 0),
      currencyCode: bill?.currency?.assignedNumber ?? '',
      currencyName: bill?.currency?.name ?? '',
      expiresOn: bill?.expiredAt,
      collectionCentre: bill?.collectionCenter?.name ?? '',
      accounts: this.accounts,
    };
  }

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

    this.billedAmount = total?.billAmt != null ? Number(total.billAmt) : null;

    // What the bill is paid on, and into. Both can be empty: a bill waits for
    // its control number, and a currency may have no internal account yet.
    const controlNumber = await this.fs.fetch({
      query: CONTROL_NUMBER_OF_BILL,
      showLoading: false,
      variables: { billDetailUid: this.billUid },
    });
    this.controlNumber = typeof controlNumber === 'string' && controlNumber ? controlNumber : null;
    const accounts = await this.fs.fetch({
      query: COLLECTION_ACCOUNTS_OF_BILL,
      showLoading: false,
      variables: { billDetailUid: this.billUid },
    });
    this.accounts = (Array.isArray(accounts) ? accounts : (accounts?.data ?? [])).map(
      (account: any) => ({
        bank: account?.issuer?.name ?? account?.name ?? '',
        accountName: account?.accountName ?? '',
        accountNumber: account?.accountNumber ?? '',
        swiftCode: account?.swiftCode ?? '',
      }),
    );

    // What each line follows. Filled before the table is built, since its
    // column reads from it.
    const links = await this.fs.fetch({
      query: BILL_ITEM_CONNECTIONS_OF_BILL,
      showLoading: false,
      variables: { billDetailUid: this.billUid },
    });
    const linkRows: any[] = Array.isArray(links) ? links : (links?.data ?? []);
    this.follows = new Map(
      linkRows
        .filter((link) => link?.child?.id && link?.parent?.assignedNumber)
        .map((link) => [link.child.id, { uid: link.uid, reference: link.parent.assignedNumber }]),
    );

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
        actionButtons: [this.setFollowsBtn, this.removeFollowsBtn],
        fetchParameter: {
          query: BILL_ITEMS_OF_BILL,
          variables: { billDetailUid: this.billUid },
        },
      },
      {
        type: 'html',
        name: 'How To Pay',
        label: 'How To Pay',
        icon: 'wallet',
        content: howToPayHtml(this.controlNumber, this.accounts),
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
      ...lineAmountPanels(this, this.billUid ?? undefined),
      ...childBillPanels(this, this.bill?.billHeader?.id),
      ...gepgFlowPanels(this.bill?.billHeader?.id, { reuse: [reuseControlNumberBtn(this)] }),
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
