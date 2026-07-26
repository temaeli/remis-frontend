import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { crudHostFromBase } from '@shared/crud';
import { ConstructionProjectSelectorComponent } from '../construction-project-selector.component';
import { ConstructionProject } from '../construction-projects.interface';
import { ALL_CONSTRUCTION_CATEGORIES } from '../construction-projects.graphql';
import { constructionCategoryCrud } from './construction-category.form';

@Component({
  selector: 'app-construction-categories',
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
export class ConstructionCategories extends BaseComponent implements OnInit {
  override title = 'Main Activities';
  override subtitle = 'Work Breakdown Structure categories, across all projects';

  keyColumns: GridKeyColumn[] = [
    'index',
    // 'project',
    { field: 'name', header: 'Main Activity' },
    { field: 'weight', header: 'Weight (%)' },
    'orderIndex',
    { field: 'progressPercent', header: 'Progress' },
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
      actionButtons: constructionCategoryCrud.tableBtns(host),
      headerButtons: [constructionCategoryCrud.upsertBtn(host)],
      reloadActions$: [constructionCategoryCrud.reload$],
      fetchParameter: {
        query: ALL_CONSTRUCTION_CATEGORIES,
        variables: { projectUid: project?.uid },
      },
      hasActionsColumn: true,
      theme: 'simple',
    });
  }
}
