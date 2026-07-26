import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ConstructionProjectSelectorComponent } from '../construction-project-selector.component';
import { ConstructionProject } from '../construction-projects.interface';
import { CONSTRUCTION_DAILY_REPORTS } from '../construction-projects.graphql';
import {
  constructionDailyReport$,
  constructionDailyReportTableBtns,
  constructionDailyReportUpsertBtn,
} from './construction-daily-report.form';

@Component({
  selector: 'app-construction-daily-reports-list',
  imports: [
    CommonModule,
    DataGridComponent,
    PageHeaderComponent,
    ConstructionProjectSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <construction-project-selector (projectSelected)="onProjectChange($event)" />
      @if (gridParameter(); as gp) {
        @for (_ of [gp]; track selectedProjectUid()) {
          <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gp" />
        }
      } @else {
        <div class="flex items-center justify-center h-64 text-sm opacity-60">
          Select a project to view its daily reports.
        </div>
      }
    </div>
  `,
})
export class ConstructionDailyReportsList extends BaseComponent {
  override title = 'Daily Site Report';
  override subtitle = 'Daily site progress reports, by project';

  keyColumns: GridKeyColumn[] = [
    'index',
    'reportDate',
    'weather',
    'workforceCount',
    'status',
    'preparedByName',
    'approvedByName',
    'actions',
  ];

  gridParameter = signal<GridParameter | null>(null);
  selectedProjectUid = signal<string | null>(null);

  onProjectChange(project: ConstructionProject | null): void {
    this.selectedProjectUid.set(project?.uid ?? null);
    if (!project) {
      this.gridParameter.set(null);
      return;
    }
    this.gridParameter.set({
      title: this.title,
      keyColumns: this.keyColumns,
      actionButtons: constructionDailyReportTableBtns(this, project.uid),
      headerButtons: [constructionDailyReportUpsertBtn(this, project.uid)],
      reloadActions$: [constructionDailyReport$],
      fetchParameter: {
        query: CONSTRUCTION_DAILY_REPORTS,
        variables: { projectUid: project.uid },
      },
      hasActionsColumn: true,
      theme: 'simple',
    });
  }
}
