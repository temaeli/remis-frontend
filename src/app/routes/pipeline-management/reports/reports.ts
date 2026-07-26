import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridKeyColumn, GridOption } from '@shared/components/data-grid/data-grid.interfaces';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { MyReportsInbox } from 'app/routes/reports/my-reports/my-reports-inbox';
import { GET_ALL_PIPELINE_REPORTS } from './report.graphql';
import {
  reportUpsertBtn,
  reportTableBtns,
  pipelineReport$,
  reportExportBtn,
  reportDeleteBtn,
} from './report.form';
import { SectionEnum } from './report.interface';

// Reports use a filter DTO instead of a top-level active flag, so the default
// active/inactive toggle has to wrap the value inside `filter`. Titles are
// scoped to the entity so the data-grid's globally-stored selectedGridOption
// from another list cannot replay stale query variables here.
const REPORT_TABLE_OPTIONS: GridOption[] = [
  {
    title: 'Active Reports',
    label: 'Active',
    queryVariables: { filter: { section: SectionEnum.PIPELINE, active: true } },
  },
  {
    title: 'Inactive Reports',
    label: 'In Active',
    queryVariables: { filter: { section: SectionEnum.PIPELINE, active: false } },
  },
];

// Single Reports page mirroring the compliance My/All tab pattern. The "My
// Reports" tab embeds the shared rich inbox (its own Awaiting/Created split,
// badge, chips, inline actions) with its header suppressed; "All Reports" is
// the full server-side list. contents-view lazy-renders tabs, so each query
// only fires when its tab is first shown.
@Component({
  selector: 'pipeline-reports',
  standalone: true,
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineReports extends BaseComponent {
  override title = 'Pipeline Reports';
  override subtitle = 'Manage Pipeline Reports';
  override actionButtons: ActionButton[] = [reportUpsertBtn(this)];

  // Inbox row actions are built against this page (the host BaseComponent that
  // owns the modal/fetch seam). The inbox prepends its own View button.
  // Workflow-progression actions (Submit/Approve/Reject/Regenerate) are
  // intentionally NOT here — they live on the report detail, so an actor must
  // open the report before acting on it (mirrors the All Reports tab).
  private inboxActions: ActionButton[] = [
    reportExportBtn(this),
    reportUpsertBtn(this),
    reportDeleteBtn(this),
  ];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'template.name', header: 'Template' },
    { field: 'template.templateType', header: 'Type' },
    { field: 'startDate', type: 'date' },
    { field: 'endDate', type: 'date' },
    { field: 'status', header: 'Approval Status' },
    'actions',
  ];

  contents: ContentParameter[] = [
    {
      type: 'component',
      slug: 'my-reports',
      icon: 'inbox',
      label: 'My Reports',
      permissions: ['ROLE_VIEW_PIPELINE_REPORT'],
      componentType: MyReportsInbox,
      componentInputs: {
        section: SectionEnum.PIPELINE,
        detailSlug: 'reports',
        reload$: pipelineReport$,
        actionButtons: this.inboxActions,
        showHeader: false,
      },
    },
    {
      type: 'table',
      slug: 'all-reports',
      icon: 'report',
      label: 'All Reports',
      permissions: ['ROLE_VIEW_PIPELINE_REPORT'],
      keyColumns: this.keyColumns,
      actionButtons: reportTableBtns(this),
      reloadActions$: [pipelineReport$],
      gridOptions: REPORT_TABLE_OPTIONS,
      viewDetailsClicks: 1,
      rowClickActions: [{ callback: (data: any) => navigateRelativeTo(this, 'reports', data.uid) }],
      fetchParameter: {
        query: GET_ALL_PIPELINE_REPORTS,
        variables: { filter: { section: SectionEnum.PIPELINE, active: true } },
      },
    },
  ];
}
