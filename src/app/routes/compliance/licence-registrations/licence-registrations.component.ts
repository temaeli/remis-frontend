import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_LICENCE_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_LICENCE_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_LICENCE_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_LICENCE_REGISTRATIONS_PAGEABLE,
  MY_LICENCE_REGISTRATIONS_PAGEABLE,
} from './licence-registration.graphql';
import { licenceRegistrationUpsertBtn } from './licence-registration.form';
import { licenceRegistrationTableBtns, licenceRegistration$ } from './licence-registration.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  CompList,
  CompListContents,
  expiryStatusColumn,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-licence-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class LicenceRegistrationsComponent extends BaseComponent {
  override title = 'Licence Registrations Management';
  override subtitle = 'Licence Registrations List';
  override actionButtons: ActionButton[] = [licenceRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'condition',
    'department',
    'duration',
    'issuedDate',
    expiryStatusColumn('expirationDate'),
    'renewalRequirement',
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    reloadActions$: [licenceRegistration$],
    actionButtons: licenceRegistrationTableBtns(this),
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_LICENCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_LICENCE_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_LICENCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_LICENCE_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_LICENCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_LICENCE_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_LICENCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_LICENCE_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_LICENCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_LICENCE_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
