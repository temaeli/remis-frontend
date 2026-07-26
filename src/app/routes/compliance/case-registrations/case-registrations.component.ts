import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_CASE_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_CASE_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_CASE_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_CASE_REGISTRATIONS_PAGEABLE,
  MY_CASE_REGISTRATIONS_PAGEABLE,
} from './case-registration.graphql';
import { caseRegistrationUpsertBtn } from './case-registration.form';
import { caseRegistrationTableBtns, caseRegistration$ } from './case-registration.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  CompList,
  CompListContents,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-case-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class CaseRegistrationsComponent extends BaseComponent {
  override title = 'Case Registrations Management';
  override subtitle = 'Case Registrations List';
  override actionButtons: ActionButton[] = [caseRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'amount',
    'dateOfSchedules',
    'decistion',
    'natureOfCase',
    'place',
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    reloadActions$: [caseRegistration$],
    actionButtons: caseRegistrationTableBtns(this),
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_CASE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_CASE_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_CASE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_CASE_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_CASE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_CASE_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_CASE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_CASE_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_CASE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_CASE_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
