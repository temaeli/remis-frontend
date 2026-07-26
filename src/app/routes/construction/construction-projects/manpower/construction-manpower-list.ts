import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { crudHostFromBase } from '@shared/crud';
import { ConstructionProjectSelectorComponent } from '../construction-project-selector.component';
import {
  ConstructionManHourSummary,
  ConstructionProject,
} from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_MANPOWER_ENTRIES,
  CONSTRUCTION_MAN_HOUR_SUMMARY,
} from '../construction-projects.graphql';
import { constructionManpowerCrud } from './construction-manpower.form';

@Component({
  selector: 'app-construction-manpower-list',
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
      <construction-project-selector
        label="Filter by Project (optional)"
        [clearable]="true"
        (projectSelected)="onProjectChange($event)"
      />
      @if (gridParameter(); as gp) {
        @for (_ of [gp]; track filterKey()) {
          <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gp" />
        }
      }
    </div>
  `,
})
export class ConstructionManpowerList extends BaseComponent implements OnInit {
  override title = 'Manpower & Man-Hours';
  override subtitle = 'Manpower / man-hour entries, across all projects';

  keyColumns: GridKeyColumn[] = [
    'index',
    'project',
    'entryDate',
    'workforceCategory',
    'personnelCount',
    'hoursPerDay',
    'manHours',
    'actions',
  ];

  gridParameter = signal<GridParameter | null>(null);
  filterKey = signal<string>('ALL');

  private manpowerSummaryBtn(project: ConstructionProject): ActionButton {
    return {
      icon: 'summarize',
      label: 'Man-Hour Summary',
      click: async () => {
        const summary: ConstructionManHourSummary = await this.fs.fetch({
          query: CONSTRUCTION_MAN_HOUR_SUMMARY,
          variables: {
            projectUid: project.uid,
            fromDate: project.startDate,
            toDate: project.endDate,
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

  ngOnInit(): void {
    this.onProjectChange(null);
  }

  onProjectChange(project: ConstructionProject | null): void {
    this.filterKey.set(project?.uid ?? 'ALL');
    const host = crudHostFromBase(this);
    const headerButtons = [constructionManpowerCrud.upsertBtn(host)];
    if (project) headerButtons.push(this.manpowerSummaryBtn(project));

    this.gridParameter.set({
      title: this.title,
      keyColumns: this.keyColumns,
      actionButtons: constructionManpowerCrud.tableBtns(host),
      headerButtons,
      reloadActions$: [constructionManpowerCrud.reload$],
      fetchParameter: {
        query: ALL_CONSTRUCTION_MANPOWER_ENTRIES,
        variables: { projectUid: project?.uid },
      },
      hasActionsColumn: true,
      theme: 'simple',
    });
  }
}
