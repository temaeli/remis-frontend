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
  GET_INSPECTION_PLAN_BY_UID,
  GET_INSPECTION_ATTACHMENTS,
} from './inspection-plan.graphql';
import {
  inspectionPlanUpsertBtn,
  inspectionPlanExecuteBtn,
  inspectionPlanCloseBtn,
  inspectionPlanDeleteBtn,
  inspectionPlan$,
} from './inspection-plan.form';
import {
  inspectionAttachmentTableBtns,
  inspectionAttachmentUpsertBtn,
  inspectionAttachment$,
} from './inspection-attachment.form';
import { InspectionChecklistComponent } from './inspection-checklist.component';
import { GET_INSPECTION_ACTION_PLANS_BY_INSPECTION } from './inspection-action-plan.graphql';
import {
  inspectionActionPlanTableBtns,
  inspectionActionPlanUpsertBtn,
  inspectionActionPlan$,
} from './inspection-action-plan.form';
import { GET_INSPECTION_ESCALATED_ISSUES_BY_INSPECTION } from './inspection-escalated-issue.graphql';
import {
  inspectionEscalatedIssueTableBtns,
  inspectionEscalatedIssueUpsertBtn,
  inspectionEscalatedIssue$,
} from './inspection-escalated-issue.form';
import { GET_INSPECTION_INSPECTORS_BY_INSPECTION } from './inspection-inspector.graphql';
import {
  inspectionInspectorTableBtns,
  inspectionInspectorUpsertBtn,
  inspectionInspector$,
} from './inspection-inspector.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'inspection-plan-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plan"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class InspectionPlanDetailComponent extends BaseComponent implements OnInit {
  override title = 'Inspection Plan';
  override subtitle = 'Inspection Plan Details';

  plan: any;
  override contents: ContentParameter[] = [];

  private planUid =
    this.route.snapshot?.paramMap?.get('planUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    inspectionPlanUpsertBtn(this),
    inspectionPlanExecuteBtn(this),
    inspectionPlanCloseBtn(this),
    inspectionPlanDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_INSPECTION_PLAN_BY_UID,
    variables: { uid: this.planUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(inspectionPlan$.subscribe(() => this.setContents()));
    this.subs.add(inspectionAttachment$.subscribe(() => this.setContents()));
    this.subs.add(inspectionActionPlan$.subscribe(() => this.setContents()));
    this.subs.add(inspectionEscalatedIssue$.subscribe(() => this.setContents()));
    this.subs.add(inspectionInspector$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.plan = await this.fs.fetch(this.fetchParameter);
    this.title = this.plan?.station ?? this.title;
    const viewPlan = formatEntityDates(this.plan, {
      extraDateTimeKeys: ['inspectedAt', 'closedAt'],
    });

    const perms: string[] = this.auth.user$.value?.permissions ?? [];
    const isOpen = !this.plan?.closedAt;
    const isExecuted = !!this.plan?.inspectedAt;
    const canEdit = isExecuted && isOpen;
    const checklistCanEdit = perms.includes('ROLE_EXECUTE_INSPECTION_PLAN') && isOpen;
    const inspectionTypeUid = this.plan?.type?.uid ?? null;

    const enrichedPlan = {
      ...(viewPlan ?? {}),
      typeName: viewPlan?.type?.name,
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
          entity: enrichedPlan,
          identity: [
            { key: 'inspectionDate', label: 'Planned Date' },
            { key: 'inspectedAt', label: 'Inspected On' },
            { key: 'closedAt', label: 'Closed On' },
          ],
          context: [
            { key: 'station', label: 'Station' },
            { key: 'area', label: 'Area' },
            { key: 'typeName', label: 'Inspection Type' },
            { key: 'category', label: 'Category' },
          ],
          operational: [],
          specifications: [
            { key: 'observation', label: 'Observation' },
            { key: 'recommendation', label: 'Recommendation' },
            { key: 'endorsementOfDoer', label: 'Endorsement of Doer' },
            { key: 'remarks', label: 'Remarks' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Attachments',
        label: 'Attachments',
        icon: 'attachment_paper',
        permissions: ['ROLE_VIEW_INSPECTION_PLAN'],
        keyColumns: [
          'index',
          'attachmentTitle',
          'mediaType',
          'mediaSize',
          { field: 'createdAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: inspectionAttachmentTableBtns(this, this.planUid ?? ''),
        reloadActions$: [inspectionAttachment$],
        fetchParameter: {
          query: GET_INSPECTION_ATTACHMENTS,
          variables: { planUid: this.planUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [inspectionAttachmentUpsertBtn(this, this.planUid ?? '')],
      },
      ...(isExecuted
        ? [
            {
              type: 'component' as const,
              name: 'Checklist',
              label: 'Checklist',
              icon: 'checklist',
              permissions: ['ROLE_VIEW_INSPECTION_PLAN'],
              componentType: InspectionChecklistComponent,
              componentInputs: {
                planUid: this.planUid,
                inspectionTypeUid,
                canEdit: checklistCanEdit,
              },
            },
            {
              type: 'table' as const,
              name: 'Action Plans',
              label: 'Action Plans',
              icon: 'list',
              permissions: ['ROLE_EXECUTE_INSPECTION_PLAN'],
              keyColumns: [
                'index',
                'action',
                'assignedTo',
                'assignedToAs',
                { field: 'durationInDays', header: 'Duration (days)' },
                { field: 'completedAt', header: 'Completed At', type: 'dateTime' as const },
                'actions',
              ],
              actionButtons: canEdit ? inspectionActionPlanTableBtns(this, this.planUid ?? '') : [],
              reloadActions$: [inspectionActionPlan$],
              fetchParameter: {
                query: GET_INSPECTION_ACTION_PLANS_BY_INSPECTION,
                variables: { inspectionUid: this.planUid },
              },
              hasActionsColumn: true,
              theme: 'simple' as const,
              headerButtons: canEdit
                ? [inspectionActionPlanUpsertBtn(this, this.planUid ?? '')]
                : [],
            },
            {
              type: 'table' as const,
              name: 'Escalated Issues',
              label: 'Escalated Issues',
              icon: 'priority_high',
              permissions: ['ROLE_EXECUTE_INSPECTION_PLAN'],
              keyColumns: [
                'index',
                {
                  field: 'escalatedTo',
                  header: 'Escalated To',
                  valueFn: (row: any) =>
                    row?.escalatedTo
                      ? `${row.escalatedTo.firstName ?? ''} ${row.escalatedTo.lastName ?? ''}`.trim() ||
                        row.escalatedTo.username
                      : '',
                },
                'remarks',
                { field: 'completedAt', header: 'Completed At', type: 'dateTime' as const },
                'actions',
              ],
              actionButtons: canEdit
                ? inspectionEscalatedIssueTableBtns(this, this.planUid ?? '')
                : [],
              reloadActions$: [inspectionEscalatedIssue$],
              fetchParameter: {
                query: GET_INSPECTION_ESCALATED_ISSUES_BY_INSPECTION,
                variables: { inspectionUid: this.planUid },
              },
              hasActionsColumn: true,
              theme: 'simple' as const,
              headerButtons: canEdit
                ? [inspectionEscalatedIssueUpsertBtn(this, this.planUid ?? '')]
                : [],
            },
          ]
        : []),
      {
        type: 'table',
        name: 'Inspectors',
        label: 'Inspectors',
        icon: 'engineering',
        permissions: ['ROLE_VIEW_INSPECTION_PLAN'],
        keyColumns: [
          'index',
          {
            field: 'inspector',
            header: 'Name',
            valueFn: (row: any) =>
              row?.inspector
                ? [row.inspector.firstName, row.inspector.middleName, row.inspector.lastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || row.inspector.username
                : '',
          },
          { field: 'inspector.username', header: 'Username' },
          'actions',
        ],
        actionButtons: isOpen ? inspectionInspectorTableBtns(this) : [],
        reloadActions$: [inspectionInspector$],
        fetchParameter: {
          query: GET_INSPECTION_INSPECTORS_BY_INSPECTION,
          variables: { planUid: this.planUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: isOpen ? [inspectionInspectorUpsertBtn(this, this.planUid ?? '')] : [],
      },
    ];

    this.cdr.detectChanges();
  }
}
