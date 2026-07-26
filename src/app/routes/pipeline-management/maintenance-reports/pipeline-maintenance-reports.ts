import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GET_PIPELINE_MAINTENANCE_REPORTS } from './maintenance-report.graphql';
import {
  pipelineMaintenanceReport$,
  pipelineMaintenanceReportStatus,
  pipelineMaintenanceReportTableBtns,
  pipelineMaintenanceReportUpsertBtn,
} from './maintenance-report.form';

// Per-pipeline maintenance reports list — dedicated reporting page that keeps
// the workflow entirely outside Configurations. Reached from the top-level
// Maintenance Performance picker; row-click leads into the report detail.
@Component({
  selector: 'pipeline-maintenance-reports',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PipelineMaintenanceReports extends BaseComponent {
  override title = 'Maintenance Performance';
  override subtitle = 'Pipeline Maintenance Performance List';

  private pipelineUid = this.route.snapshot?.paramMap?.get('pipelineUid') ?? '';

  override actionButtons: ActionButton[] = [
    pipelineMaintenanceReportUpsertBtn(this, this.pipelineUid),
  ];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    { field: 'createdAtDate', header: 'Report Date', type: 'date' },
    { field: 'approvalStatus', header: 'Approval Status' },
    { field: 'stage', header: 'Stage' },
    {
      field: 'status',
      header: 'Workflow',
      valueFn: (row: any) => pipelineMaintenanceReportStatus(row) ?? '',
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Maintenance Performance',
    icon: 'hammer',
    keyColumns: this.keyColumns,
    actionButtons: pipelineMaintenanceReportTableBtns(this, this.pipelineUid),
    reloadActions$: [pipelineMaintenanceReport$],
    fetchParameter: {
      query: GET_PIPELINE_MAINTENANCE_REPORTS,
      variables: { pipelineUid: this.pipelineUid, active: true },
    },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) =>
          this.router.navigate(['/pipeline-management/maintenance-reports', data.uid]),
      },
    ],
  };
}
