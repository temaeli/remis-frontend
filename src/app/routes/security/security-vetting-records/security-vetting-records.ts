import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_VETTING_RECORDS_PAGEABLE } from './security-vetting-record.graphql';
import {
  securityVettingRecordUpsertBtn,
  securityVettingRecordTableBtns,
  securityVettingRecord$,
} from './security-vetting-record.form';

@Component({
  selector: 'security-vetting-records',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityVettingRecords extends BaseComponent {
  override title = 'Vetting Records';
  override subtitle = 'Manage personnel vetting records';
  override actionButtons: ActionButton[] = [securityVettingRecordUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'referenceNumber',
    'firstName',
    'surname',
    'subjectType',
    'recommendation',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Vetting Records',
    icon: 'how_to_reg',
    keyColumns: this.keyColumns,
    actionButtons: securityVettingRecordTableBtns(this),
    reloadActions$: [securityVettingRecord$],
    fetchParameter: { query: ALL_SECURITY_VETTING_RECORDS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-vetting-records', data.uid),
      },
    ],
  };
}
