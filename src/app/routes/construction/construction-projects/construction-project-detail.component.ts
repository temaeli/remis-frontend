import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { crudHostFromBase } from '@shared/crud';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { buildNarrative } from '../../pipeline-management/pipeline-module.constants';

import {
  FIND_CONSTRUCTION_PROJECT,
  CONSTRUCTION_CATEGORIES,
  CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
  CONSTRUCTION_DAILY_REPORTS,
  CONSTRUCTION_TASKS,
  CONSTRUCTION_MAN_HOUR_SUMMARY,
  CONSTRUCTION_MONTHLY_REPORTS,
} from './construction-projects.graphql';
import {
  constructionProject$,
  constructionProjectDeleteBtn,
  constructionProjectRecomputeBtn,
  constructionProjectUpsertBtn,
  constructionProjectValidateWeightsBtn,
} from './construction-project.form';
import { ConstructionProjectDashboardComponent } from './construction-project-dashboard.component';
import { ConstructionProjectGanttComponent } from './construction-project-gantt.component';
import { constructionCategoryCrud } from './categories/construction-category.form';
import { constructionActivityCrud } from './activities/construction-activity.form';
import { constructionMilestoneCrud } from './milestones/construction-milestone.form';
import { constructionDailyProgressCrud } from './daily-progress/construction-daily-progress.form';
import {
  constructionDailyReport$,
  constructionDailyReportTableBtns,
  constructionDailyReportUpsertBtn,
} from './daily-reports/construction-daily-report.form';
import { constructionManpowerCrud } from './manpower/construction-manpower.form';
import { constructionConstraintCrud } from './constraints/construction-constraint.form';
import { constructionTaskCrud } from './tasks/construction-task.form';
import { constructionComplianceCrud } from './compliance/construction-compliance.form';
import { constructionProcurementCrud } from './procurement/construction-procurement.form';
import {
  constructionMonthlyReport$,
  constructionMonthlyReportTableBtns,
  constructionMonthlyReportUpsertBtn,
} from './monthly-reports/construction-monthly-report.form';
import { ConstructionManHourSummary } from './construction-projects.interface';
import { CrudHost, EntityCrudContext } from '@shared/crud';

@Component({
  selector: 'construction-project-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="project"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ConstructionProjectDetailComponent extends BaseComponent implements OnInit {
  override title = 'Construction Project';
  override subtitle = 'Construction project overview';

  project: any;
  override contents: ContentParameter[] = [];

  private projectUid =
    this.route.snapshot?.paramMap?.get('constructionProjectUid') ??
    this.route.snapshot?.paramMap?.get('uid') ??
    '';

  override actionButtons: ActionButton[] = [
    constructionProjectUpsertBtn(this),
    constructionProjectValidateWeightsBtn(this),
    constructionProjectRecomputeBtn(this),
    constructionProjectDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_CONSTRUCTION_PROJECT,
    variables: { uid: this.projectUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(constructionProject$.subscribe(() => this.setContents()));
    this.subs.add(constructionDailyReport$.subscribe(() => this.setContents()));
    this.subs.add(constructionCategoryCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionActivityCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionMilestoneCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionDailyProgressCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionManpowerCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionConstraintCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionTaskCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionComplianceCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionProcurementCrud.reload$.subscribe(() => this.setContents()));
    this.subs.add(constructionMonthlyReport$.subscribe(() => this.setContents()));
  }

  /** Context passed to every entity-crud form opened from this page, so forms hide their own project picker. */
  private get crudCtx(): EntityCrudContext {
    return { fixedProjectUid: this.projectUid };
  }

  /**
   * Wraps an entity-crud's upsert button so "Add" seeds the form with the
   * project we're already viewing, instead of asking the user to pick it
   * again. `seed` must match the shape the entity's modelMapper expects
   * (e.g. `{ project: { uid } }` or, for Activity, `{ category: { project: { uid } } }`).
   */
  private addForProject(
    crud: { upsertBtn: (host: CrudHost, ctx?: EntityCrudContext) => ActionButton },
    host: CrudHost,
    seed: any,
  ): ActionButton {
    const btn = crud.upsertBtn(host, this.crudCtx);
    return { ...btn, click: () => btn.click?.(seed) };
  }

  private manpowerSummaryBtn(): ActionButton {
    return {
      icon: 'summarize',
      label: 'Man-Hour Summary',
      click: async () => {
        const summary: ConstructionManHourSummary = await this.fs.fetch({
          query: CONSTRUCTION_MAN_HOUR_SUMMARY,
          variables: {
            projectUid: this.projectUid,
            fromDate: this.project?.startDate,
            toDate: this.project?.endDate,
          },
        });
        if (!summary) return;
        const lines = (summary.byCategory ?? [])
          .map((c) => `${c.workforceCategory ?? 'Unspecified'}: ${c.manHours ?? 0} man-hours`)
          .join(' | ');
        this.notify.info(
          `Total: ${summary.totalManHours ?? 0} man-hours across ${summary.totalPersonnelDays ?? 0} personnel-days. ${lines}`,
        );
      },
    };
  }

  async setContents(): Promise<void> {
    this.project = await this.fs.fetch(this.fetchParameter);
    this.title = this.project?.name ?? this.title;
    const host = crudHostFromBase(this);

    const viewProject = formatEntityDates(this.project);

    const projectNarrative = buildNarrative({
      flavor: 'entity',
      entity: viewProject,
      identity: [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
      ],
      context: [
        { key: 'clientName', label: 'Client' },
        { key: 'contractor.name', label: 'Contractor' },
        { key: 'contractNumber', label: 'Contract Number' },
        { key: 'physicalAddress', label: 'Physical Address' },
      ],
      specifications: [
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'durationDays', label: 'Duration (Days)' },
        { key: 'progressPercent', label: 'Progress (%)' },
        { key: 'description', label: 'Description' },
      ],
    });

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...projectNarrative,
        // Flatten the Identity/Context/Specifications/... sub-groups into one plain field list.
        detailsGroups: [
          { fields: (projectNarrative.detailsGroups ?? []).flatMap((g) => g.fields ?? []) },
        ],
        showFirstGroupHeader: false,
      },
      {
        type: 'component',
        name: 'Project Dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        componentType: ConstructionProjectDashboardComponent,
        componentInputs: { projectUid: this.projectUid },
      },
      {
        type: 'table',
        name: 'Categories',
        label: 'Main Activity',
        icon: 'category',
        permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_CATEGORY', 'ROLE_VIEW_CONSTRUCTION_CATEGORY'],
        keyColumns: [
          'index',
          { field: 'name', header: 'Main Activity' },
          { field: 'weight', header: 'Weight (%)' },
           { field: 'startDate', header: 'Start Date' },
            { field: 'endDate', header: 'End Date' },

          { field: 'progressPercent', header: 'Progress' },
          'actions',
        ],
        actionButtons: constructionCategoryCrud.tableBtns(host, [], this.crudCtx),
        headerButtons: [
          this.addForProject(constructionCategoryCrud, host, { project: { uid: this.projectUid } }),
        ],
        reloadActions$: [constructionCategoryCrud.reload$],
        fetchParameter: {
          query: CONSTRUCTION_CATEGORIES,
          variables: { projectUid: this.projectUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
      },

      {
        type: 'table',
        name: 'Sub Activities',
        label: 'Sub Activities',
        icon: 'checklist',
        permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_ACTIVITY', 'ROLE_VIEW_CONSTRUCTION_ACTIVITY'],
        keyColumns: [
          'index',
          'category as Main Activity',
          'name as Sub Activity',
          'unitOfMeasure',
          'plannedQuantity',
          'completedQuantity',
          'weight',
          'status',
          'progressPercent',
          'actions',
        ],
        groupByKeys: ['category'],
        actionButtons: constructionActivityCrud.tableBtns(host, [], this.crudCtx),
        headerButtons: [
          this.addForProject(constructionActivityCrud, host, {
            category: { project: { uid: this.projectUid } },
          }),
        ],
        reloadActions$: [constructionActivityCrud.reload$],
        fetchParameter: {
          query: CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
          variables: { projectUid: this.projectUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
      },

      {
        type: 'table',
        name: 'DailyReports',
        label: 'Daily Site Report',
        icon: 'report',
        permissions: [
          'ROLE_VIEW_ALL_CONSTRUCTION_DAILY_REPORT',
          'ROLE_VIEW_CONSTRUCTION_DAILY_REPORT',
        ],
        keyColumns: [
          'index',
          'reportDate',
          'weather',
          'workforceCount',
          'status',
          'preparedByName',
          'approvedByName',
          'actions',
        ],
        actionButtons: constructionDailyReportTableBtns(this, this.projectUid),
        headerButtons: [constructionDailyReportUpsertBtn(this, this.projectUid)],
        reloadActions$: [constructionDailyReport$],
        fetchParameter: {
          query: CONSTRUCTION_DAILY_REPORTS,
          variables: { projectUid: this.projectUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
      },
      {
        type: 'component',
        name: 'Schedule',
        label: 'Schedule',
        icon: 'timetable',
        componentType: ConstructionProjectGanttComponent,
        componentInputs: { projectUid: this.projectUid },
      },
      {
        type: 'table',
        name: 'MonthlyReports',
        label: 'Monthly Project Report',
        icon: 'report',
        permissions: [
          'ROLE_VIEW_ALL_CONSTRUCTION_MONTHLY_REPORT',
          'ROLE_VIEW_CONSTRUCTION_MONTHLY_REPORT',
        ],
        keyColumns: [
          'index',
          'reportYear',
          'reportMonth',
          'overallProgressPercent',
          'status',
          'preparedByName',
          'approvedByName',
          'actions',
        ],
        actionButtons: constructionMonthlyReportTableBtns(this, this.projectUid),
        headerButtons: [constructionMonthlyReportUpsertBtn(this, this.projectUid)],
        reloadActions$: [constructionMonthlyReport$],
        fetchParameter: {
          query: CONSTRUCTION_MONTHLY_REPORTS,
          variables: { projectUid: this.projectUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
      },
    ];

    this.cdr.detectChanges();
  }
}
