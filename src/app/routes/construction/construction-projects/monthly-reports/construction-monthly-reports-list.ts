import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ConstructionProjectSelectorComponent } from '../construction-project-selector.component';
import { ConstructionProject } from '../construction-projects.interface';
import { CONSTRUCTION_MONTHLY_REPORTS } from '../construction-projects.graphql';
import {
  constructionMonthlyReport$,
  constructionMonthlyReportTableBtns,
  constructionMonthlyReportUpsertBtn,
} from './construction-monthly-report.form';

@Component({
  selector: 'app-construction-monthly-reports-list',
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
          Select a project to view its monthly reports.
        </div>
      }
    </div>
  `,
})
export class ConstructionMonthlyReportsList extends BaseComponent {
  override title = 'Monthly Project Report';
  override subtitle = 'Monthly project reports, by project';

  keyColumns: GridKeyColumn[] = [
    'index',
    'reportYear',
    'reportMonth',
    'overallProgressPercent',
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
      actionButtons: constructionMonthlyReportTableBtns(this, project.uid),
      headerButtons: [constructionMonthlyReportUpsertBtn(this, project.uid)],
      reloadActions$: [constructionMonthlyReport$],
      fetchParameter: {
        query: CONSTRUCTION_MONTHLY_REPORTS,
        variables: { projectUid: project.uid },
      },
      hasActionsColumn: true,
      theme: 'simple',
    });
  }
}
