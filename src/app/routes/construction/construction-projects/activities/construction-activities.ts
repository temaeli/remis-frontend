import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { crudHostFromBase } from '@shared/crud';
import { ConstructionProjectSelectorComponent } from '../construction-project-selector.component';
import { ConstructionProject } from '../construction-projects.interface';
import { ALL_CONSTRUCTION_ACTIVITIES } from '../construction-projects.graphql';
import { constructionActivityCrud } from './construction-activity.form';

@Component({
  selector: 'app-construction-activities',
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
export class ConstructionActivities extends BaseComponent implements OnInit {
  override title = 'Sub Activities';
  override subtitle = 'Sub-activities, across all projects';

  keyColumns: GridKeyColumn[] = [
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
  ];

  gridParameter = signal<GridParameter | null>(null);
  filterKey = signal<string>('ALL');

  ngOnInit(): void {
    this.onProjectChange(null);
  }

  onProjectChange(project: ConstructionProject | null): void {
    this.filterKey.set(project?.uid ?? 'ALL');
    const host = crudHostFromBase(this);
    this.gridParameter.set({
      title: this.title,
      keyColumns: this.keyColumns,
      groupByKeys: ['category'],
      actionButtons: constructionActivityCrud.tableBtns(host),
      headerButtons: [constructionActivityCrud.upsertBtn(host)],
      reloadActions$: [constructionActivityCrud.reload$],
      fetchParameter: {
        query: ALL_CONSTRUCTION_ACTIVITIES,
        variables: { projectUid: project?.uid },
      },
      hasActionsColumn: true,
      theme: 'simple',
    });
  }
}
