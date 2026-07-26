import { buildNarrative } from '../pipeline-module.constants';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_MAINTENANCE_ACTIVITY_BY_UID } from './maintenance-report.graphql';
import {
  pipelineMaintenanceReport$,
  pipelineMaintenanceReportApproveBtn,
  pipelineMaintenanceReportDeleteBtn,
  pipelineMaintenanceReportRejectBtn,
  pipelineMaintenanceReportSubmitBtn,
  pipelineMaintenanceReportUpsertBtn,
} from './maintenance-report.form';

@Component({
  selector: 'pipeline-maintenance-report-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="report"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineMaintenanceReportDetailComponent extends BaseComponent implements OnInit {
  override title = 'Maintenance Performance';
  override subtitle = 'Maintenance Performance Details';

  report: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    pipelineMaintenanceReportUpsertBtn(this),
    pipelineMaintenanceReportSubmitBtn(this),
    pipelineMaintenanceReportApproveBtn(this),
    pipelineMaintenanceReportRejectBtn(this),
    pipelineMaintenanceReportDeleteBtn(this),
  ];

  private reportUid = this.route.snapshot?.paramMap?.get('reportUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_MAINTENANCE_ACTIVITY_BY_UID,
    variables: { uid: this.reportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(pipelineMaintenanceReport$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.report = await this.fs.fetch(this.fetchParameter);
    this.title = this.report?.name ?? this.title;
    const viewReport = formatEntityDates(this.report);
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;

    const enriched = {
      ...(viewReport ?? {}),
      pipelineName: viewReport?.pipeline?.name,
      createdByName: fullName(viewReport?.createdBy),
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'entity',
          entity: enriched,
          identity: [
            { key: 'name', label: 'Report Name' },
            { key: 'pipelineName', label: 'Pipeline' },
            { key: 'createdAtDate', label: 'Report Date' },
          ],
          context: [
            { key: 'approvalStatus', label: 'Approval Status' },
            { key: 'stage', label: 'Stage' },
            { key: 'createdByName', label: 'Created By' },
          ],
          specifications: [{ key: 'remarks', label: 'Remarks' }],
          operational: [{ key: 'comment', label: 'Approval / Rejection Comment' }],
        }),
      },
      {
        type: 'table',
        name: 'Items',
        label: 'Items',
        icon: 'hammer',
        title: 'Maintenance Items',
        keyColumns: [
          'index',
          { field: 'item.name', header: 'Item' },
          { field: 'plannedMaintenance', header: 'Planned' },
          { field: 'plannedMaintenanceDone', header: 'Planned Done' },
          { field: 'plannedMaintenanceNotDone', header: 'Planned Not Done' },
          { field: 'unPlannedMaintenanceDone', header: 'Unplanned Done' },
        ],
        fetchParameter: {
          ...this.fetchParameter,
          resMapFn: (res: any) => res?.data?.items ?? res?.items ?? [],
        },
      },
    ];

    this.cdr.detectChanges();
  }
}
