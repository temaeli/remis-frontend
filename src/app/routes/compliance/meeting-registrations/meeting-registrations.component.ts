import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import {
  ALL_MEETING_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_MEETING_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_MEETING_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_MEETING_REGISTRATIONS_PAGEABLE,
  MY_MEETING_REGISTRATIONS_PAGEABLE,
} from './meeting-registration.graphql';
import { meetingRegistrationUpsertBtn } from './meeting-registration.form';
import { meetingRegistrationTableBtns, meetingRegistration$ } from './meeting-registration.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  CompList,
  CompListContents,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-meeting-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class MeetingRegistrationsComponent extends BaseComponent {
  override title = 'Meeting Registrations Management';
  override subtitle = 'Meeting Registrations List';
  override actionButtons: ActionButton[] = [meetingRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'category',
    'conductedDate',
    'confirmationDate',
    'upcomingSchedule',
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    reloadActions$: [meetingRegistration$],
    actionButtons: meetingRegistrationTableBtns(this),
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_MEETING_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_MEETING_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_MEETING_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_MEETING_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_MEETING_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_MEETING_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_MEETING_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_MEETING_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_MEETING_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_MEETING_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
