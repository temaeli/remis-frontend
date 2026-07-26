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
  GET_HSE_MEETING_BY_UID,
  GET_HSE_MEETING_ATTENDANCE_ATTACHMENTS,
  GET_HSE_MEETING_MINUTES_ATTACHMENTS,
  GENERATE_HSE_MEETING_REPORT,
} from './meeting.graphql';
import { MEETING_CATEGORY_LABELS, MeetingCategory } from './meeting.interface';
import {
  hseMeetingUpsertBtn,
  hseMeetingConfirmBtn,
  hseMeetingResendInvitationsBtn,
  hseMeetingMarkCompletedBtn,
  hseMeetingApproveBtn,
  hseMeetingRejectBtn,
  hseMeetingDeleteBtn,
  hseMeeting$,
} from './meeting.form';
import {
  hseMeetingAttendanceTableBtns,
  hseMeetingAttendanceUpsertBtn,
  hseMeetingMinutesTableBtns,
  hseMeetingMinutesUpsertBtn,
  hseMeetingAttendance$,
  hseMeetingMinutes$,
} from './meeting-attachment.form';
import { GET_HSE_MEETING_AGENDAS_BY_MEETING } from './meeting-agenda.graphql';
import {
  hseMeetingAgendaTableBtns,
  hseMeetingAgendaUpsertBtn,
  hseMeetingAgenda$,
} from './meeting-agenda.form';
import { GET_HSE_MEETING_ATTENDEES_BY_MEETING } from './meeting-attendee.graphql';
import {
  hseMeetingAttendeeTableBtns,
  hseMeetingAttendeeUpsertBtn,
  hseMeetingAttendee$,
} from './meeting-attendee.form';
import { GET_HSE_MEETING_ACTION_PLANS_BY_MEETING } from './meeting-action-plan.graphql';
import {
  hseMeetingActionPlanTableBtns,
  hseMeetingActionPlanUpsertBtn,
  hseMeetingActionPlan$,
} from './meeting-action-plan.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'hse-meeting-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="meeting"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class HseMeetingDetailComponent extends BaseComponent implements OnInit {
  override title = 'HSE Meeting';
  override subtitle = 'Meeting Details';

  meeting: any;
  override contents: ContentParameter[] = [];

  private meetingUid =
    this.route.snapshot?.paramMap?.get('meetingUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    hseMeetingUpsertBtn(this),
    hseMeetingConfirmBtn(this),
    hseMeetingResendInvitationsBtn(this),
    hseMeetingMarkCompletedBtn(this),
    hseMeetingApproveBtn(this),
    hseMeetingRejectBtn(this),
    this.generateReportBtn(),
    hseMeetingDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_HSE_MEETING_BY_UID,
    variables: { uid: this.meetingUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(hseMeeting$.subscribe(() => this.setContents()));
    this.subs.add(hseMeetingAttendance$.subscribe(() => this.setContents()));
    this.subs.add(hseMeetingMinutes$.subscribe(() => this.setContents()));
    this.subs.add(hseMeetingAgenda$.subscribe(() => this.setContents()));
    this.subs.add(hseMeetingAttendee$.subscribe(() => this.setContents()));
    this.subs.add(hseMeetingActionPlan$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.meeting = await this.fs.fetch(this.fetchParameter);
    this.title = this.meeting?.title ?? this.title;
    const viewMeeting = formatEntityDates(this.meeting, {
      extraDateTimeKeys: [
        'startTime',
        'endTime',
        'confirmedAt',
        'completedAt',
        'approvedAt',
        'rejectedAt',
      ],
    });

    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const enrichedMeeting = {
      ...(viewMeeting ?? {}),
      completedByName: fullName(viewMeeting?.completedBy),
      confirmedByName: fullName(viewMeeting?.confirmedBy),
      actedByName: fullName(viewMeeting?.actedBy),
      onlineMeetingLabel: viewMeeting?.onlineMeeting ? 'Yes' : 'No',
      categoryLabel: viewMeeting?.category
        ? (MEETING_CATEGORY_LABELS[viewMeeting.category as MeetingCategory] ?? viewMeeting.category)
        : undefined,
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'event',
          entity: enrichedMeeting,
          identity: [
            { key: 'startTime', label: 'Start Time' },
            { key: 'endTime', label: 'End Time' },
            { key: 'confirmedAt', label: 'Confirmed On' },
            { key: 'completedAt', label: 'Completed On' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'rejectedAt', label: 'Rejected On' },
          ],
          context: [
            { key: 'categoryLabel', label: 'Category' },
            { key: 'location', label: 'Location' },
            { key: 'onlineMeetingLabel', label: 'Online Meeting' },
            { key: 'meetingLink', label: 'Meeting Link' },
          ],
          operational: [
            { key: 'organizer', label: 'Organizer' },
            { key: 'confirmedByName', label: 'Confirmed By' },
            { key: 'completedByName', label: 'Completed By' },
            { key: 'actedByName', label: 'Reviewed By' },
          ],
          specifications: [
            { key: 'title', label: 'Title' },
            { key: 'description', label: 'Description' },
            { key: 'status', label: 'Status' },
            { key: 'comment', label: 'Review Comment' },
            { key: 'remarks', label: 'Remarks' },
            { key: 'reminderMinutes', label: 'Reminder (minutes)' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Agendas',
        label: 'Agendas',
        icon: 'checklist',
        permissions: ['ROLE_VIEW_HSE_MEETING'],
        keyColumns: [
          'index',
          { field: 'indexOrder', header: 'Order' },
          { field: 'name', header: 'Agenda' },
          'notes',
          'actions',
        ],
        actionButtons: hseMeetingAgendaTableBtns(this, this.meetingUid ?? ''),
        reloadActions$: [hseMeetingAgenda$],
        fetchParameter: {
          query: GET_HSE_MEETING_AGENDAS_BY_MEETING,
          variables: {
            meetingUid: this.meetingUid,
            pageableParam: { sortBy: 'indexOrder', sortDirection: 'ASC' },
          },
        },
        currentSort: { sortBy: 'indexOrder', sortDirection: 'ASC' },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [hseMeetingAgendaUpsertBtn(this, this.meetingUid ?? '')],
      },
      {
        type: 'table',
        name: 'Attendees',
        label: 'Attendees',
        icon: 'people',
        permissions: ['ROLE_VIEW_HSE_MEETING'],
        keyColumns: [
          'index',
          'name',
          'designation',
          'section',
          'organization',
          { field: 'contact', header: 'Email' },
          {
            field: 'attended',
            header: 'Attended',
            valueFn: (row: any) => (row?.attended ? 'Yes' : 'No'),
          },
          'actions',
        ],
        actionButtons: hseMeetingAttendeeTableBtns(this, this.meetingUid ?? ''),
        reloadActions$: [hseMeetingAttendee$],
        fetchParameter: {
          query: GET_HSE_MEETING_ATTENDEES_BY_MEETING,
          variables: { meetingUid: this.meetingUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [hseMeetingAttendeeUpsertBtn(this, this.meetingUid ?? '')],
      },
      {
        type: 'table',
        name: 'AttendanceAttachments',
        label: 'Attendance Attachments',
        icon: 'group',
        permissions: ['ROLE_VIEW_HSE_MEETING'],
        keyColumns: [
          'index',
          'attachmentTitle',
          'mediaType',
          'mediaSize',
          { field: 'createdAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: hseMeetingAttendanceTableBtns(this, this.meetingUid ?? ''),
        reloadActions$: [hseMeetingAttendance$],
        fetchParameter: {
          query: GET_HSE_MEETING_ATTENDANCE_ATTACHMENTS,
          variables: { meetingUid: this.meetingUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [hseMeetingAttendanceUpsertBtn(this, this.meetingUid ?? '')],
      },
      {
        type: 'table',
        name: 'MinutesAttachments',
        label: 'Minutes Attachments',
        icon: 'description',
        permissions: ['ROLE_VIEW_HSE_MEETING'],
        keyColumns: [
          'index',
          'attachmentTitle',
          'mediaType',
          'mediaSize',
          { field: 'createdAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: hseMeetingMinutesTableBtns(this, this.meetingUid ?? ''),
        reloadActions$: [hseMeetingMinutes$],
        fetchParameter: {
          query: GET_HSE_MEETING_MINUTES_ATTACHMENTS,
          variables: { meetingUid: this.meetingUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [hseMeetingMinutesUpsertBtn(this, this.meetingUid ?? '')],
      },
      {
        type: 'table',
        name: 'ActionPlans',
        label: 'Action Plans',
        icon: 'target',
        permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
        keyColumns: [
          'index',
          'action',
          'assignedTo',
          'assignedToAs',
          { field: 'durationInDays', header: 'Duration (days)' },
          { field: 'dueDate', type: 'date' },
          { field: 'completedAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: hseMeetingActionPlanTableBtns(this, this.meetingUid ?? '', enrichedMeeting),
        reloadActions$: [hseMeetingActionPlan$],
        fetchParameter: {
          query: GET_HSE_MEETING_ACTION_PLANS_BY_MEETING,
          variables: { meetingUid: this.meetingUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [
          hseMeetingActionPlanUpsertBtn(this, this.meetingUid ?? '', enrichedMeeting),
        ],
      },
    ];

    this.cdr.detectChanges();
  }

  private generateReportBtn(): ActionButton {
    return {
      icon: 'pdf',
      label: 'Generate Report',
      color: 'primary',
      toolTip: 'Generate HSE Meeting Report (PDF)',
      permissions: ['ROLE_VIEW_HSE_MEETING'],
      click: async () => {
        const res = await this.fs.fetch({
          query: GENERATE_HSE_MEETING_REPORT,
          variables: { uid: this.meetingUid },
        });
        const base64 = typeof res === 'string' ? res : (res?.data ?? null);
        if (!base64) return;
        const byteChars = atob(base64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hse-meeting-${this.meetingUid}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
    };
  }
}
