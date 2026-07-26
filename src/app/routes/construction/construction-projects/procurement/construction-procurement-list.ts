import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { crudHostFromBase } from '@shared/crud';
import { ConstructionProjectSelectorComponent } from '../construction-project-selector.component';
import { ConstructionProject } from '../construction-projects.interface';
import { CONSTRUCTION_PROCUREMENTS } from '../construction-projects.graphql';
import { constructionProcurementCrud } from './construction-procurement.form';

@Component({
  selector: 'app-construction-procurement-list',
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
export class ConstructionProcurementList extends BaseComponent implements OnInit {
  override title = 'Procurement';
  override subtitle = 'Material / equipment procurement tracking, across all projects';

  keyColumns: GridKeyColumn[] = [
    'index',
    'project',
    'materialName',
    'supplier',
    'deliveryStatus',
    'deliveryPercent',
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
      actionButtons: constructionProcurementCrud.tableBtns(host),
      headerButtons: [constructionProcurementCrud.upsertBtn(host)],
      reloadActions$: [constructionProcurementCrud.reload$],
      fetchParameter: {
        query: CONSTRUCTION_PROCUREMENTS,
        variables: { projectUid: project?.uid },
      },
      hasActionsColumn: true,
      theme: 'simple',
    });
  }
}
