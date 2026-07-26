import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS, MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GET_ALL_PIPELINES } from '../pipelines/pipeline.graphql';

// Top-level maintenance-reports entry: a lightweight pipelines list that
// deep-links into Pipeline Detail's Maintenance Reports sub-tab. Kept
// deliberately separate from the Pipelines admin list so this reporting
// entry has no config-side buttons or columns.
@Component({
  selector: 'maintenance-reports-index',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class MaintenanceReportsIndex extends BaseComponent {
  override title = 'Maintenance Performance';
  override subtitle = 'Pick a pipeline to view its maintenance performance records';

  keyColumns: GridKeyColumn[] = ['index', 'name', 'status', 'description', 'actions'];

  private rowActions: ActionButton[] = [
    {
      icon: 'view',
      label: 'View Maintenance Performance',
      permissions: ['ROLE_VIEW_MAINTENANCE_ACTIVITY', 'ROLE_MANAGE_MAINTENANCE_ACTIVITY'],
      click: (data: any) =>
        this.router.navigate(['/pipeline-management/maintenance-reports/pipeline', data.uid]),
    },
  ];

  gridParameter: GridParameter = {
    title: 'Pipelines',
    icon: 'hammer',
    keyColumns: this.keyColumns,
    actionButtons: [{ ...MORE_BTN, buttons: this.rowActions }],
    hasActionsColumn: true,
    fetchParameter: { query: GET_ALL_PIPELINES, variables: { active: true } },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) =>
          this.router.navigate(['/pipeline-management/maintenance-reports/pipeline', data.uid]),
      },
    ],
  };
}
