import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

import {
  CHECK_PAYMENT_TOTAL,
  CHECK_PAYMENT_TRANSACTION,
  FIND_PAYMENT,
  PAYMENT_DELIVERY_STATUS,
  PAYMENT_TOTAL_OF_PAYMENT,
  PAYMENT_TRANSACTIONS_OF_PAYMENT,
} from './payment.graphql';
import { PAYMENT_VIEW_PERMISSIONS } from './payment.form';
import { printReceipt } from './bill-documents';

/**
 * One payment: what GePG reported, the transactions it settled, and what it
 * comes to.
 *
 * Read-only. Every amount is derived from the bill the payment answers, so
 * nothing here is editable — but it can be re-checked, which is what the button
 * in the header does.
 */
@Component({
  selector: 'app-payment',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [data]="payment"
        [actionButtons]="actionButtons"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PaymentComponent extends BaseComponent implements OnInit {
  override title = 'Payment';
  override subtitle = 'What GePG reported, and whether it agrees with the bill';

  payment: any;
  paymentUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [this.checkIntegrityBtn()];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PAYMENT,
    successFn: (res) => (this.title = `Payment ${res?.data?.customerControlNumber ?? ''}`),
    variables: { uid: this.paymentUid },
  };

  transactionColumns: GridKeyColumn[] = [
    'index',
    'transactionId as Transaction Id',
    'billId as Bill Id',
    'payerName as Payer',
    'usedPaymentChannel as Channel',
    'currency.name as Currency',
    { field: 'billAmount', header: 'Billed' },
    { field: 'paidAmount', header: 'Paid' },
    { field: 'balance', header: 'Balance' },
    { field: 'paidAmountEquivalentTzs', header: 'Paid (TZS)' },
    { field: 'transactionDateTime', header: 'Paid At' },
    'actions',
  ];

  /**
   * The rules against one transaction rather than the whole payment.
   *
   * Checking the payment checks everything, which is the right default but a
   * blunt answer when a payment carries a dozen transactions and one of them
   * disagrees with its bill. This says which.
   */
  checkTransactionBtn(): ActionButton {
    return {
      icon: 'shield',
      label: 'Check',
      toolTip: 'Check this transaction against the bill item it pays for',
      permissions: PAYMENT_VIEW_PERMISSIONS,
      click: async (row: { id?: string; transactionId?: string }) => {
        const problems: string[] = await this.fs.fetch({
          query: CHECK_PAYMENT_TRANSACTION,
          variables: { uid: row?.id },
        });

        if (!problems?.length) {
          this.notify.success(`Transaction ${row?.transactionId ?? ''} agrees with its bill item`);
          return;
        }
        this.notify.error(
          `${problems.length} problem${problems.length > 1 ? 's' : ''}:<br>• ${problems.join('<br>• ')}`,
        );
      },
    };
  }

  /**
   * The receipt for one transaction, as the GePG guide lays it out. It says what
   * GePG reported and nothing more: the amount paid, what is left, and the lines
   * of the bill it was paid against. Issued in the name of whoever prints it.
   */
  printReceiptBtn(): ActionButton {
    return {
      icon: 'receipt',
      label: 'Print Receipt',
      toolTip: 'Print the government receipt for this transaction',
      permissions: PAYMENT_VIEW_PERMISSIONS,
      click: async (row: any) => {
        // A transaction pays the whole bill: every line of it goes on the receipt.
        const lines: any[] = row?.billItems ?? [];
        await printReceipt(
          {
            institution: row?.spCode?.name ?? '',
            receiptNumber: row?.paymentReferenceId || row?.transactionId || '',
            receivedFrom: row?.payerName ?? '',
            amount: row?.paidAmount ?? 0,
            outstandingBalance: row?.balance ?? 0,
            items: lines.map((line) => ({
              description: [line.gfsCode?.name, line.name].filter(Boolean).join(' - '),
              amount: line.finalBillItemAmt ?? 0,
            })),
            totalBilled: row?.billAmount ?? 0,
            currencyCode: row?.currency?.assignedNumber ?? '',
            currencyName: row?.currency?.name ?? '',
            billReference: row?.billId ?? '',
            paymentControlNumber:
              row?.billControlNumber || this.payment?.customerControlNumber || '',
            paymentDate: row?.transactionDateTime,
          },
          { user: this.auth.user$.value?.name ?? '', at: new Date() },
        );
      },
    };
  }

  /**
   * Re-runs the integrity rules against what is stored.
   *
   * Worth having as an action rather than only on write: an exchange rate
   * edited or a fee corrected can make a payment that was clean when it arrived
   * stop agreeing with its bill, and nothing would otherwise say so. It checks
   * the totals, which revalidates every transaction and the whole bill behind
   * them.
   */
  checkIntegrityBtn(): ActionButton {
    return {
      icon: 'shield',
      label: 'Check Integrity',
      toolTip: 'Re-run the payment rules against the bill behind it',
      permissions: PAYMENT_VIEW_PERMISSIONS,
      click: async () => {
        const total = await this.fs.fetch({
          query: PAYMENT_TOTAL_OF_PAYMENT,
          showLoading: false,
          variables: { paymentHeaderUid: this.paymentUid },
        });

        if (!total?.id) {
          this.notify.warn('This payment has no totals recorded yet, so there is nothing to check');
          return;
        }

        const problems: string[] = await this.fs.fetch({
          query: CHECK_PAYMENT_TOTAL,
          variables: { uid: total.id },
        });

        if (!problems?.length) {
          this.notify.success('Every rule passes — this payment agrees with its bill');
          return;
        }
        // Shown as a list rather than a single line: a payment usually breaks
        // several rules at once, and which ones is the whole answer.
        this.notify.error(
          `${problems.length} problem${problems.length > 1 ? 's' : ''}:<br>• ${problems.join('<br>• ')}`,
        );
      },
    };
  }

  async ngOnInit(): Promise<void> {
    const response = await this.fs.fetch(this.fetchParameter);
    this.payment = response?.data ?? response;

    // Both are absent until GePG has delivered the transactions, so neither is
    // an error — they are the normal state of a payment mid-delivery.
    const total = await this.fs.fetch({
      query: PAYMENT_TOTAL_OF_PAYMENT,
      showLoading: false,
      variables: { paymentHeaderUid: this.paymentUid },
    });

    const delivery = await this.fs.fetch({
      query: PAYMENT_DELIVERY_STATUS,
      showLoading: false,
      variables: { uid: this.paymentUid },
    });

    this.contents = [
      {
        type: 'details',
        name: 'Payment Details',
        label: 'Payment Details',
        icon: 'coins',
        showUndefined: true,
        entity: { ...this.payment, deliveryStatus: delivery ?? 'Unknown' },
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Transactions',
        label: 'Transactions',
        icon: 'list',
        keyColumns: this.transactionColumns,
        actionButtons: [this.printReceiptBtn(), this.checkTransactionBtn()],
        fetchParameter: {
          query: PAYMENT_TRANSACTIONS_OF_PAYMENT,
          variables: { paymentHeaderUid: this.paymentUid },
        },
      },
      {
        type: 'details',
        name: 'Totals',
        label: 'Totals',
        icon: 'calculator',
        showUndefined: true,
        entity: total?.id
          ? {
              totalBilled: total.totalBillAmount,
              totalPaid: total.totalPaidAmount,
              totalPaidTzs: total.totalPaidAmountEquivalentTzs,
              totalBalance: total.totalBalance,
              totalBalanceTzs: total.totalBalanceEquivalentTzs,
            }
          : { totalBilled: 'Not yet totalled', totalPaid: '—', totalBalance: '—' },
      },
    ];

    this.cdr.detectChanges();
  }
}
