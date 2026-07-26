import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { processStatusFromTimestamps } from '@shared/crud';
import { GET_ALL_MANPOWER_ATTENDANCES } from './manpower-attendance.graphql';
import {
  attendanceUpsertBtn,
  attendanceTableBtns,
  manpowerAttendance$,
} from './manpower-attendance.form';

@Component({
  selector: 'manpower-attendances',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class ManpowerAttendances extends BaseComponent {
  override title = 'Manpower Attendances';
  override subtitle = 'Manage Manpower Attendances';
  override actionButtons: ActionButton[] = [attendanceUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'date', type: 'date' },
    { field: 'station.name', header: 'Working Station' },
    {
      field: 'totalAttended',
      header: 'Total',
      valueFn: (row: any) =>
        (row?.manpowerAttended ?? []).reduce((s: number, r: any) => s + (r?.attended ?? 0), 0),
    },
    {
      field: 'status',
      header: 'Approval Status',
      valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Manpower Attendances',
    icon: 'group',
    keyColumns: this.keyColumns,
    actionButtons: attendanceTableBtns(this),
    reloadActions$: [manpowerAttendance$],
    fetchParameter: { query: GET_ALL_MANPOWER_ATTENDANCES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'manpower-attendances', data.uid),
      },
    ],
  };
}
