import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { attachmentViewBtn } from '@shared/components/attachment-viewer/attachment-view-button';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';
import { ConstructionDailyReportView } from '../construction-projects.interface';
import { CONSTRUCTION_DAILY_REPORT_VIEW } from '../construction-projects.graphql';
import { constructionDailyReport$, constructionDailyReportTableBtns } from './construction-daily-report.form';

@Component({
  selector: 'construction-daily-report-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="view?.report"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ConstructionDailyReportDetailComponent extends BaseComponent implements OnInit {
  override title = 'Daily Site Report';
  override subtitle = 'Daily site report details';

  view?: ConstructionDailyReportView;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  private reportUid = this.route.snapshot?.paramMap?.get('reportUid') ?? '';

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: CONSTRUCTION_DAILY_REPORT_VIEW,
    variables: { uid: this.reportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(constructionDailyReport$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.view = await this.fs.fetch(this.fetchParameter);
    const report = this.view?.report;
    this.title = report ? `Daily Report - ${report.reportDate}` : this.title;
    this.actionButtons = constructionDailyReportTableBtns(this, report?.project?.uid ?? '');

    const viewEntity = formatEntityDates(report);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        entity: viewEntity,
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'entity',
          entity: viewEntity,
          identity: [
            { key: 'reportDate', label: 'Report Date' },
            { key: 'status', label: 'Status' },
            { key: 'weather', label: 'Weather' },
          ],
          context: [
            { key: 'project.name', label: 'Project' },
            { key: 'subContractor', label: 'Sub-Contractor' },
            { key: 'financier', label: 'Financier' },
            { key: 'staffAtSite', label: 'Staff at Site' },
          ],
          specifications: [
            { key: 'workforceCount', label: 'Workforce Count' },
            { key: 'visitors', label: 'Visitors' },
            { key: 'workPerformed', label: 'Work Performed' },
            { key: 'quantitiesCompleted', label: 'Quantities Completed' },
            { key: 'hseObservations', label: 'HSE Observations' },
            { key: 'qualityControl', label: 'Quality Control' },
            { key: 'challenges', label: 'Challenges & Issues' },
            { key: 'correctiveActions', label: 'Corrective Actions' },
            { key: 'planForNextDay', label: 'Plan for Next Day' },
            { key: 'toolBoxMeeting', label: 'Tool Box Meeting' },
            { key: 'preparedByName', label: 'Prepared By' },
            { key: 'checkedByName', label: 'Checked By' },
            { key: 'approvedByName', label: 'Approved By' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Manpower',
        label: 'Manpower',
        icon: 'worker',
        theme: 'simple',
        keyColumns: ['index', 'workforceCategory', 'personnelCount', 'hoursPerDay', 'manHours', 'note'],
        gridData: this.view?.manpower ?? [],
      },
      {
        type: 'table',
        name: 'Constraints',
        label: 'Constraints & Risks',
        icon: 'warning',
        theme: 'simple',
        keyColumns: ['index', 'title', 'impactLevel', 'status', 'responsiblePerson', 'description'],
        gridData: this.view?.constraints ?? [],
      },
      {
        type: 'table',
        name: 'DailyProgress',
        label: 'Daily Progress',
        icon: 'graph',
        theme: 'simple',
        keyColumns: ['index', 'activity', 'cumulativeQuantity', 'dailyQuantity', 'note'],
        gridData: this.view?.dailyProgress ?? [],
      },
      {
        type: 'table',
        name: 'Attachments',
        label: 'Attachments',
        icon: 'attach_file',
        theme: 'simple',
        keyColumns: ['attachmentTitle', 'mediaType', 'mediaSize', 'actions'],
        actionButtons: [
          attachmentViewBtn(this, [
            'ROLE_VIEW_ALL_CONSTRUCTION_DAILY_REPORT',
            'ROLE_VIEW_CONSTRUCTION_DAILY_REPORT',
          ]),
        ],
        hasActionsColumn: true,
        gridData: this.view?.attachments ?? [],
      },
    ];

    this.cdr.detectChanges();
  }
}
