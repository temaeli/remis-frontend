import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_INVESTIGATION } from './security-investigation.graphql';
import {
  securityInvestigationUpsertBtn,
  securityInvestigation$,
} from './security-investigation.form';
import { SECURITY_ACTION_ITEMS_BY_SOURCE } from '../security-action-items/security-action-item.graphql';
import {
  securityActionItemSourceButtons,
  SECURITY_ACTION_SOURCE,
} from '../security-action-items/security-action-item.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';
import { attachmentsContent } from '../shared/security-attachments';
import { SECURITY_INVESTIGATION_ATTACHMENTS } from '../shared/security-attachments.graphql';
import { securityPdfBtn } from '../shared/security-pdf';
import { SECURITY_INVESTIGATION_PDF } from '../shared/security-pdf.graphql';

@Component({
  selector: 'security-investigation-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="investigation"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityInvestigationDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Investigation';
  override subtitle = 'Security Investigation Details';

  investigation: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityInvestigationUpsertBtn(this),
    securityPdfBtn(this, {
      query: SECURITY_INVESTIGATION_PDF,
      variablesFn: (row) => ({ investigationUid: row?.uid ?? this.investigationUid }),
      fileNameFn: (row) => `security-investigation-${row?.referenceNumber ?? row?.uid ?? ''}`,
      permissions: ['ROLE_VIEW_ALL_SECURITY_INVESTIGATION', 'ROLE_VIEW_SECURITY_INVESTIGATION'],
    }),
  ];

  private investigationUid = this.route.snapshot?.paramMap?.get('securityInvestigationUid');

  private actionItems = securityActionItemSourceButtons(
    this,
    SECURITY_ACTION_SOURCE.INVESTIGATION,
    this.investigationUid ?? undefined,
  );

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_INVESTIGATION,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.investigationUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityInvestigation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.investigation = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.investigation);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: view,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Action Items',
        label: 'Action Items',
        icon: 'task',
        keyColumns: [
          'index',
          'observationReported',
          'priority',
          'status',
          'responsibleName',
          'actions',
        ],
        headerButtons: [this.actionItems.upsertBtn],
        actionButtons: this.actionItems.tableBtns,
        reloadActions$: [this.actionItems.reload$],
        fetchParameter: {
          query: SECURITY_ACTION_ITEMS_BY_SOURCE,
          variables: {
            sourceType: SECURITY_ACTION_SOURCE.INVESTIGATION,
            sourceUid: this.investigationUid,
          },
          refetchActions: [this.actionItems.reload$],
        },
      },
      attachmentsContent(
        this,
        SECURITY_INVESTIGATION_ATTACHMENTS,
        { investigationUid: this.investigationUid },
        ['ROLE_VIEW_ALL_SECURITY_INVESTIGATION', 'ROLE_VIEW_SECURITY_INVESTIGATION'],
      ),
      approvalHistoryContent(SECURITY_SUBJECT.INVESTIGATION, this.investigationUid),
    ];

    this.cdr.detectChanges();
  }
}
