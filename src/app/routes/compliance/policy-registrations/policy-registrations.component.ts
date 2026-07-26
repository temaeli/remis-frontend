import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_POLICY_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_POLICY_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_POLICY_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_POLICY_REGISTRATIONS_PAGEABLE,
  MY_POLICY_REGISTRATIONS_PAGEABLE,
} from './policy-registration.graphql';
import { policyRegistrationUpsertBtn } from './policy-registration.form';
import { policyRegistrationTableBtns, policyRegistration$ } from './policy-registration.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  CompList,
  CompListContents,
  expiryStatusColumn,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-policy-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class PolicyRegistrationsComponent extends BaseComponent {
  override title = 'Policy Registrations Management';
  override subtitle = 'Policy Registrations List';
  override actionButtons: ActionButton[] = [policyRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'applicability',
    'dateOfReview',
    'department',
    'endorsementDate',
    // 'expirationDate',
    expiryStatusColumn('expirationDate'),
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    reloadActions$: [policyRegistration$],
    actionButtons: policyRegistrationTableBtns(this),
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_POLICY_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_POLICY_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_POLICY_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_POLICY_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_POLICY_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_POLICY_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_POLICY_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_POLICY_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_POLICY_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_POLICY_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
