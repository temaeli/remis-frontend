import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import {
  ALL_RECONCILIATION_REQUESTS,
  ALL_RECONCILIATION_STATEMENTS,
} from './reconciliation.graphql';
import { requestReconciliationBtn, resendReconciliationBtn } from './reconciliation.actions';

/**
 * Reconciliation: what we asked GePG for, and what it sent back.
 *
 * Its own screen rather than a corner of the payments list, because it is not
 * about a payment or a bill. A reconciliation names a date and a service
 * provider group, and the statement that answers it covers every bill paid that
 * day — so a bill's screen is the wrong place for it and the payments grid was
 * only ever where the button happened to sit.
 *
 * Two tabs on purpose. GePG acknowledges a request and delivers the statement
 * separately, so a request with no statement beside it is one that has not been
 * answered yet — which is the thing worth being able to see.
 */
@Component({
  selector: 'app-reconciliation',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="headerActions" />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ReconciliationComponent extends BaseComponent implements OnInit {
  override title = 'Reconciliation';
  override subtitle = 'What GePG was asked to confirm, and the statements it returned';

  headerActions = [requestReconciliationBtn(this)];

  requestColumns: GridKeyColumn[] = [
    'index',
    { field: 'assignedNumber', header: 'Request ID' },
    { field: 'transactionDate', header: 'Day Reconciled' },
    { field: 'spGrpCode', header: 'SP Group Code', valueFn: (row) => row?.spGrpCode?.assignedNumber },
    { field: 'systemCode', header: 'System Code', valueFn: (row) => row?.systemCode?.assignedNumber },
    { field: 'requestedAt', header: 'Asked At' },
    'actions',
  ];

  statementColumns: GridKeyColumn[] = [
    'index',
    { field: 'responseId', header: 'Response ID' },
    { field: 'requestId', header: 'Request ID' },
    { field: 'spGrpCode', header: 'SP Group Code' },
    { field: 'paymentStatusCode', header: 'Status Code' },
    { field: 'paymentStatusDescription', header: 'Status' },
    { field: 'createdAt', header: 'Received' },
  ];

  override contents: ContentParameter[] = [];

  async ngOnInit(): Promise<void> {
    this.contents = [
      {
        type: 'table',
        name: 'Requests',
        label: 'Requests',
        icon: 'refresh',
        keyColumns: this.requestColumns,
        // Asking again for a day already on the list, from the row that records
        // it -- see `resendReconciliationBtn`.
        actionButtons: [resendReconciliationBtn(this)],
        noContentLabel: 'No reconciliation has been asked for yet',
        fetchParameter: { query: ALL_RECONCILIATION_REQUESTS },
      },
      {
        type: 'table',
        name: 'Statements',
        label: 'Statements',
        icon: 'list',
        keyColumns: this.statementColumns,
        noContentLabel: 'GePG has not returned a statement yet',
        fetchParameter: { query: ALL_RECONCILIATION_STATEMENTS },
      },
    ];

    this.cdr.detectChanges();
  }
}
