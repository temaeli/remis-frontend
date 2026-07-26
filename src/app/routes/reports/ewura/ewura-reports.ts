import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn, GridOption } from '@shared/components/data-grid/data-grid.interfaces';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_EWURA_REPORTS } from './ewura-report.graphql';
import { ewuraReportUpsertBtn, ewuraReportTableBtns, ewuraReport$ } from './ewura-report.form';
import { SectionEnum } from './ewura-report.interface';

const EWURA_REPORT_TABLE_OPTIONS: GridOption[] = [
  {
    title: 'Active EWURA Reports',
    label: 'Active',
    queryVariables: { filter: { section: SectionEnum.REPORT, active: true } },
  },
  {
    title: 'Inactive EWURA Reports',
    label: 'In Active',
    queryVariables: { filter: { section: SectionEnum.REPORT, active: false } },
  },
];

@Component({
  selector: 'ewura-reports',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class EwuraReports extends BaseComponent {
  override title = 'EWURA Reports';
  override subtitle = 'Manage EWURA Reports';
  override actionButtons: ActionButton[] = [ewuraReportUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'template.name', header: 'Template' },
    { field: 'template.templateType', header: 'Type' },
    { field: 'startDate', type: 'date' },
    { field: 'endDate', type: 'date' },
    { field: 'status', header: 'Approval Status' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'EWURA Reports',
    icon: 'report',
    keyColumns: this.keyColumns,
    actionButtons: ewuraReportTableBtns(this),
    reloadActions$: [ewuraReport$],
    fetchParameter: {
      query: GET_ALL_EWURA_REPORTS,
      variables: { filter: { section: SectionEnum.REPORT, active: true } },
    },
    gridOptions: EWURA_REPORT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'ewura', data.uid),
      },
    ],
  };
}
