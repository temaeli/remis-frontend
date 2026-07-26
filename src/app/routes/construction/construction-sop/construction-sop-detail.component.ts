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
  CONSTRUCTION_NON_CONFORMITIES,
  CONSTRUCTION_SOP_CHECKLIST,
  FIND_CONSTRUCTION_SOP_RECORD,
} from './construction-sop.graphql';
import {
  constructionSopApproveBtn,
  constructionSopDeleteBtn,
  constructionSopEditBtn,
  constructionSopRejectBtn,
  constructionSopReviewBtn,
  constructionSopSubmitBtn,
  constructionSop$,
  constructionNonConformity$,
  constructionNonConformityTableBtns,
  constructionNonConformityUpsertBtn,
} from './construction-sop.form';
import { buildNarrative } from '../../pipeline-management/pipeline-module.constants';

const fullName = (u: any): string | undefined => {
  if (!u) return undefined;
  return u.fullName ?? u.username ?? undefined;
};

@Component({
  selector: 'construction-sop-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="record"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ConstructionSopDetailComponent extends BaseComponent implements OnInit {
  override title = 'Construction SOP Record';
  override subtitle = 'Standard Operating Procedure Execution Record';

  record: any;
  override contents: ContentParameter[] = [];

  private recordUid =
    this.route.snapshot?.paramMap?.get('recordUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    constructionSopEditBtn(this),
    constructionSopSubmitBtn(this),
    constructionSopReviewBtn(this),
    constructionSopApproveBtn(this),
    constructionSopRejectBtn(this),
    constructionSopDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_CONSTRUCTION_SOP_RECORD,
    variables: { uid: this.recordUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(constructionSop$.subscribe(() => this.setContents()));
    this.subs.add(constructionNonConformity$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.record = await this.fs.fetch(this.fetchParameter);
    this.title = this.record?.referenceNumber ?? this.title;

    const viewRecord = formatEntityDates(this.record, {
      extraDateTimeKeys: ['executionDate', 'submittedAt', 'reviewedAt', 'approvedAt'],
    });

    const enrichedRecord = {
      ...(viewRecord ?? {}),
      sopName: viewRecord?.sop?.name,
      supervisorName: fullName(viewRecord?.supervisor),
      fieldEngineerName: fullName(viewRecord?.fieldEngineer),
      qcInspectorName: fullName(viewRecord?.qcInspector),
      approverName: fullName(viewRecord?.approver),
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'event',
          entity: enrichedRecord,
          identity: [
            { key: 'referenceNumber', label: 'Reference Number' },
            { key: 'executionDate', label: 'Execution Date' },
            { key: 'executionTime', label: 'Execution Time' },
          ],
          context: [
            { key: 'sopName', label: 'SOP' },
            { key: 'location', label: 'Location' },
            { key: 'teamId', label: 'Team ID' },
          ],
          operational: [
            { key: 'supervisorName', label: 'Supervisor' },
            { key: 'fieldEngineerName', label: 'Field Engineer' },
            { key: 'qcInspectorName', label: 'QC Inspector' },
            { key: 'status', label: 'Status' },
          ],
          specifications: [
            { key: 'summary', label: 'Summary' },
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'reviewedAt', label: 'Reviewed On' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'approverName', label: 'Approved By' },
            { key: 'approverComments', label: 'Approver Comments' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'ChecklistItems',
        label: 'Checklist Items',
        icon: 'checklist',
        keyColumns: ['index', 'ordering', 'outcome', 'comment', 'description'],
        reloadActions$: [constructionSop$],
        fetchParameter: {
          query: CONSTRUCTION_SOP_CHECKLIST,
          variables: { recordUid: this.recordUid },
        },
        theme: 'simple',
      },
      {
        type: 'table',
        name: 'NonConformities',
        label: 'Non-Conformities',
        icon: 'report',
        keyColumns: [
          'index',
          'description',
          'status',
          { field: 'dueDate', type: 'date' },
          'correctiveAction',
          'actions',
        ],
        actionButtons: constructionNonConformityTableBtns(this, this.recordUid ?? ''),
        reloadActions$: [constructionNonConformity$],
        fetchParameter: {
          query: CONSTRUCTION_NON_CONFORMITIES,
          variables: { recordUid: this.recordUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [constructionNonConformityUpsertBtn(this, this.recordUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
