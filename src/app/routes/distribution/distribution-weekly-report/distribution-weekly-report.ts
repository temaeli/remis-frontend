import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  distributionWeeklyReportUpsertBtn,
  distributionWeeklyReportTableBtns,
  distributionWeeklyReport$,
} from './distribution-weekly-report.form';
import { ALL_DISTRIBUTION_WEEKLY_REPORTS_PAGEABLE } from './distribution-weekly-report.graphql';

@Component({
  selector: 'app-distribution-weekly-report',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class DistributionWeeklyReport extends BaseComponent {
  override title = 'Distribution Weekly Reports';
  override subtitle = 'Weekly Operation Reports Management';
  override actionButtons: ActionButton[] = [distributionWeeklyReportUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'weekStartDate as Start Date',
    'weekEndDate as End Date',
    'region',
    'status',
    'manHoursWorked',
    'totalConsumptionMmscf',
    'preventiveMaintenanceCompleted',
    'correctiveMaintenanceCompleted',
    'lostTimeInjuries',
    'nearMissCount',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: distributionWeeklyReportTableBtns(this),
    reloadActions$: [distributionWeeklyReport$],
    fetchParameter: {
      query: ALL_DISTRIBUTION_WEEKLY_REPORTS_PAGEABLE,
    },
  };
}
