import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_HSE_REPORT, GET_HSE_REPORT_STAGES } from './hse-report.graphql';
import { reportStageLabel } from 'app/routes/settings/report-template/report-actor.form';
import {
  hseReportUpsertBtn,
  hseReportSubmitBtn,
  hseReportApproveBtn,
  hseReportRejectBtn,
  hseReportDeleteBtn,
  hseReportRegenerateBtn,
  hseReportExportBtn,
  hseReport$,
} from './hse-report.form';
import { buildNarrative } from '../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'hse-report-detail',
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
export class HseReportDetailComponent extends BaseComponent implements OnInit {
  override title = 'HSE Report';
  override subtitle = 'HSE Report Workflow';

  report: any;
  override contents: ContentParameter[] = [];

  private reportUid = this.route.snapshot?.paramMap?.get('reportUid');

  override actionButtons: ActionButton[] = [
    hseReportUpsertBtn(this),
    hseReportSubmitBtn(this),
    hseReportApproveBtn(this),
    hseReportRejectBtn(this),
    hseReportRegenerateBtn(this),
    hseReportExportBtn(this),
    hseReportDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_HSE_REPORT,
    variables: { uid: this.reportUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(hseReport$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.report = await this.fs.fetch(this.fetchParameter);
    this.title = this.report?.template?.name ?? this.title;
    const viewReport = formatEntityDates(this.report);
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const stage = viewReport?.currentStage;
    const enrichedReport = {
      ...(viewReport ?? {}),
      templateName: viewReport?.template?.name,
      templateType: viewReport?.template?.templateType,
      currentStageLabel: stage
        ? reportStageLabel(stage.assignedTo?.action) || stage.assignedTo?.action || undefined
        : undefined,
      currentStageRole: stage?.assignedTo?.role?.name,
      currentStageActor: fullName(stage?.actor),
      currentStageStatus: stage?.status,
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
          entity: enrichedReport,
          identity: [
            { key: 'startDate', label: 'Period Start' },
            { key: 'endDate', label: 'Period End' },
          ],
          context: [
            { key: 'templateName', label: 'Report Template' },
            { key: 'templateType', label: 'Template Type' },
            { key: 'sourceId', label: 'Source ID' },
            { key: 'section', label: 'Section' },
          ],
          specifications: [
            { key: 'description', label: 'Description' },
            { key: 'status', label: 'Report Status' },
            { key: 'currentStageLabel', label: 'Current Stage' },
            { key: 'currentStageStatus', label: 'Stage Status' },
          ],
          operational: [
            { key: 'currentStageRole', label: 'Awaiting Role' },
            { key: 'currentStageActor', label: 'Stage Actor' },
          ],
        }),
      },
      {
        type: 'html',
        name: 'Content',
        label: 'Content',
        icon: 'description',
        content: this.report?.content ?? '',
      },
      {
        type: 'table',
        name: 'Stages',
        label: 'Stages',
        icon: 'history',
        keyColumns: [
          'index',
          {
            field: 'assignedTo.role.name',
            header: 'Role',
            valueFn: (row: any) => row?.assignedTo?.role?.name ?? '',
          },
          {
            field: 'assignedTo.action',
            header: 'Stage',
            valueFn: (row: any) => reportStageLabel(row?.assignedTo?.action),
          },
          {
            field: 'actor.firstName',
            header: 'Actor',
            valueFn: (row: any) =>
              row?.actor ? `${row.actor.firstName ?? ''} ${row.actor.lastName ?? ''}`.trim() : '',
          },
          { field: 'status', header: 'Approval Status' },
          { field: 'actedAt', header: 'Acted At', type: 'dateTime' },
          'comments',
        ],
        reloadActions$: [hseReport$],
        fetchParameter: {
          query: GET_HSE_REPORT_STAGES,
          variables: { uid: this.reportUid },
        },
        theme: 'simple',
      },
    ];

    this.cdr.detectChanges();
  }
}
