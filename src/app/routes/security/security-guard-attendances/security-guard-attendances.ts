import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ALL_SECURITY_GUARD_ATTENDANCES_PAGEABLE } from './security-guard-attendance.graphql';
import {
  securityGuardAttendanceUpsertBtn,
  securityGuardAttendanceTableBtns,
  securityGuardAttendance$,
} from './security-guard-attendance.form';

@Component({
  selector: 'security-guard-attendances',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityGuardAttendances extends BaseComponent {
  override title = 'Guard Attendance';
  override subtitle = 'Record daily guard attendance';
  override actionButtons: ActionButton[] = [securityGuardAttendanceUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'guardName',
    'attendanceDate',
    'status',
    'remarks',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Guard Attendance',
    icon: 'fact_check',
    keyColumns: this.keyColumns,
    actionButtons: securityGuardAttendanceTableBtns(this),
    reloadActions$: [securityGuardAttendance$],
    fetchParameter: { query: ALL_SECURITY_GUARD_ATTENDANCES_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
  };
}
