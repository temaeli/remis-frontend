import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  GET_ALL_MANPOWER_ATTENDED_BY_ATTENDANCE,
  GET_MANPOWER_ATTENDANCE_BY_UID,
} from './manpower-attendance.graphql';
import {
  attendanceUpsertBtn,
  attendanceDeleteBtn,
  attendanceSubmitBtn,
  attendanceApproveBtn,
  attendanceRejectBtn,
  attendedTableBtnsForAttendance,
  attendedUpsertBtnForAttendance,
  manpowerAttendance$,
  manpowerAttended$,
} from './manpower-attendance.form';

@Component({
  selector: 'manpower-attendance-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="attendance"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ManpowerAttendanceDetailComponent extends BaseComponent implements OnInit {
  override title = 'Manpower Attendance';
  override subtitle = 'Manpower Attendance Details';

  attendance: any;
  override contents: ContentParameter[] = [];

  // Pipeline mounts this detail with `data: { readOnly: true }` so the Working
  // Station drill-in is view-only; HSE mounts it mutable. All management of
  // attendance lives in HSE.
  private readOnly = !!this.route.snapshot?.data?.['readOnly'];

  override actionButtons: ActionButton[] = this.readOnly
    ? []
    : [
        attendanceUpsertBtn(this),
        attendanceSubmitBtn(this),
        attendanceApproveBtn(this),
        attendanceRejectBtn(this),
        attendanceDeleteBtn(this),
      ];

  private attendanceUid = this.route.snapshot?.paramMap?.get('manpowerAttendanceUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_MANPOWER_ATTENDANCE_BY_UID,
    variables: { uid: this.attendanceUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(manpowerAttendance$.subscribe(() => this.setContents()));
    this.subs.add(manpowerAttended$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.attendance = await this.fs.fetch(this.fetchParameter);
    const attendanceUid = this.attendance?.uid ?? this.attendanceUid ?? '';
    const viewAttendance = formatEntityDates(this.attendance);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['manpowerAttended'],
        entity: viewAttendance,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Attended',
        label: 'Attended by Category',
        icon: 'group',
        keyColumns: this.readOnly
          ? [
              'index',
              { field: 'category.name', header: 'Category' },
              'attended',
              { field: 'totalManHours', header: 'Total Man Hours' },
            ]
          : [
              'index',
              { field: 'category.name', header: 'Category' },
              'attended',
              { field: 'totalManHours', header: 'Total Man Hours' },
              'actions',
            ],
        actionButtons: this.readOnly ? [] : attendedTableBtnsForAttendance(this, attendanceUid),
        reloadActions$: [manpowerAttended$],
        fetchParameter: {
          query: GET_ALL_MANPOWER_ATTENDED_BY_ATTENDANCE,
          variables: { attendanceUid, active: true },
        },
        hasActionsColumn: !this.readOnly,
        theme: 'simple',
        headerButtons: this.readOnly ? [] : [attendedUpsertBtnForAttendance(this, attendanceUid)],
      },
    ];

    this.cdr.detectChanges();
  }
}
