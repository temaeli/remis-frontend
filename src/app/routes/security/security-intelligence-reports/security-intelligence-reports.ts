import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_INTELLIGENCE_REPORTS_PAGEABLE } from './security-intelligence-report.graphql';
import {
  securityIntelligenceReportUpsertBtn,
  securityIntelligenceReportTableBtns,
  securityIntelligenceReport$,
} from './security-intelligence-report.form';

@Component({
  selector: 'security-intelligence-reports',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityIntelligenceReports extends BaseComponent {
  override title = 'Intelligence Reports';
  override subtitle = 'Capture and review intelligence reports';
  override actionButtons: ActionButton[] = [securityIntelligenceReportUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'referenceNumber',
    'operationName',
    'eventAt',
    'assessment',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Intelligence Reports',
    icon: 'visibility',
    keyColumns: this.keyColumns,
    actionButtons: securityIntelligenceReportTableBtns(this),
    reloadActions$: [securityIntelligenceReport$],
    fetchParameter: { query: ALL_SECURITY_INTELLIGENCE_REPORTS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) =>
          navigateRelativeTo(this, 'security-intelligence-reports', data.uid),
      },
    ],
  };
}
