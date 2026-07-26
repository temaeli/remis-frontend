import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn, GridOption } from '@shared/components/data-grid/data-grid.interfaces';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_HSE_REPORTS } from './hse-report.graphql';
import { hseReportUpsertBtn, hseReportTableBtns, hseReport$ } from './hse-report.form';
import { SectionEnum } from './hse-report.interface';

const HSE_REPORT_TABLE_OPTIONS: GridOption[] = [
  {
    title: 'Active HSE Reports',
    label: 'Active',
    queryVariables: { filter: { section: SectionEnum.HSE, active: true } },
  },
  {
    title: 'Inactive HSE Reports',
    label: 'In Active',
    queryVariables: { filter: { section: SectionEnum.HSE, active: false } },
  },
];

@Component({
  selector: 'hse-reports',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class HseReports extends BaseComponent {
  override title = 'HSE Reports';
  override subtitle = 'Manage HSE Reports';
  override actionButtons: ActionButton[] = [hseReportUpsertBtn(this)];

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
    title: 'HSE Reports',
    icon: 'report',
    keyColumns: this.keyColumns,
    actionButtons: hseReportTableBtns(this),
    reloadActions$: [hseReport$],
    fetchParameter: {
      query: GET_ALL_HSE_REPORTS,
      variables: { filter: { section: SectionEnum.HSE, active: true } },
    },
    gridOptions: HSE_REPORT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'hse', data.uid),
      },
    ],
  };
}
