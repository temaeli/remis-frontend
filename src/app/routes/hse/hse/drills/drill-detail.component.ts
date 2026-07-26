import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  GENERATE_HSE_DRILL_REPORT,
  GET_DRILL_ACTION_PLANS,
  GET_DRILL_ATTACHMENTS,
  GET_HSE_DRILL_BY_UID,
} from './drill.graphql';
import {
  hseDrill$,
  hseDrillDeleteBtn,
  hseDrillEndorseBtn,
  hseDrillEnterDataBtn,
  hseDrillRejectBtn,
  hseDrillReviewBtn,
  hseDrillSubmitBtn,
  hseDrillUpsertBtn,
} from './drill.form';
import {
  drillAttachment$,
  drillAttachmentTableBtns,
  drillAttachmentUpsertBtn,
} from './drill-attachment.form';
import {
  drillActionPlan$,
  drillActionPlanTableBtns,
  drillActionPlanUpsertBtn,
} from './drill-action-plan.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'hse-drill-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="drill"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class HseDrillDetailComponent extends BaseComponent implements OnInit {
  override title = 'HSE Drill';
  override subtitle = 'Drill Details';

  drill: any;
  override contents: ContentParameter[] = [];

  private drillUid =
    this.route.snapshot?.paramMap?.get('drillUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    hseDrillUpsertBtn(this),
    hseDrillSubmitBtn(this),
    hseDrillReviewBtn(this),
    hseDrillEndorseBtn(this),
    hseDrillEnterDataBtn(this),
    hseDrillRejectBtn(this),
    hseDrillDeleteBtn(this),
    this.generateReportBtn(),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_HSE_DRILL_BY_UID,
    variables: { uid: this.drillUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(hseDrill$.subscribe(() => this.setContents()));
    this.subs.add(drillAttachment$.subscribe(() => this.setContents()));
    this.subs.add(drillActionPlan$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.drill = await this.fs.fetch(this.fetchParameter);
    this.title = this.drill?.category ?? this.title;
    const viewDrill = formatEntityDates(this.drill, {
      extraDateTimeKeys: ['submittedAt', 'reviewedAt', 'endorsedAt'],
    });

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'event',
          entity: viewDrill,
          identity: [
            { key: 'financialYear', label: 'Financial Year' },
            { key: 'quarter', label: 'Quarter' },
            { key: 'dateConducted', label: 'Date Conducted' },
          ],
          context: [
            { key: 'category', label: 'Category' },
            { key: 'location', label: 'Location' },
          ],
          operational: [
            { key: 'status', label: 'Status' },
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'reviewedAt', label: 'Reviewed On' },
            { key: 'endorsedAt', label: 'Endorsed On' },
          ],
          specifications: [
            { key: 'description', label: 'Description' },
            { key: 'observation', label: 'Observation' },
            { key: 'recommendation', label: 'Recommendation' },
            { key: 'supervisorComments', label: 'Supervisor Comments' },
            { key: 'managerComments', label: 'Manager Comments' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Attachments',
        label: 'Attachments',
        icon: 'attachment_paper',
        permissions: ['ROLE_VIEW_HSE_DRILL'],
        keyColumns: [
          'index',
          'attachmentTitle',
          'mediaType',
          'mediaSize',
          { field: 'createdAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: drillAttachmentTableBtns(this, this.drillUid ?? ''),
        reloadActions$: [drillAttachment$],
        fetchParameter: {
          query: GET_DRILL_ATTACHMENTS,
          variables: { planUid: this.drillUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [drillAttachmentUpsertBtn(this, this.drillUid ?? '')],
      },
      {
        type: 'table',
        name: 'ActionPlans',
        label: 'Action Plans',
        icon: 'list',
        permissions: ['ROLE_ENTER_HSE_DRILL_DATA', 'ROLE_VIEW_HSE_DRILL'],
        keyColumns: [
          'index',
          'action',
          'assignedTo',
          'assignedToAs',
          { field: 'durationInDays', header: 'Duration (days)' },
          { field: 'completedAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: drillActionPlanTableBtns(this, this.drillUid ?? ''),
        reloadActions$: [drillActionPlan$],
        fetchParameter: {
          query: GET_DRILL_ACTION_PLANS,
          variables: { drillUid: this.drillUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [drillActionPlanUpsertBtn(this, this.drillUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }

  private generateReportBtn(): ActionButton {
    return {
      icon: 'pdf',
      label: 'Generate Report',
      color: 'primary',
      toolTip: 'Generate Drill Report (PDF)',
      permissions: ['ROLE_VIEW_HSE_DRILL_REPORT'],
      click: async () => {
        const res = await this.fs.fetch({
          query: GENERATE_HSE_DRILL_REPORT,
          variables: { uid: this.drillUid },
        });
        const base64 = typeof res === 'string' ? res : (res?.data ?? null);
        if (!base64) return;
        const byteChars = atob(base64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hse-drill-${this.drillUid}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
    };
  }
}
