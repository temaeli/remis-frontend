import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import {
  ALL_INSURANCE_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_INSURANCE_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_INSURANCE_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_INSURANCE_REGISTRATIONS_PAGEABLE,
  MY_INSURANCE_REGISTRATIONS_PAGEABLE,
} from './insurance-registration.graphql';
import { insuranceRegistrationUpsertBtn } from './insurance-registration.form';
import {
  insuranceRegistrationTableBtns,
  insuranceRegistration$,
} from './insurance-registration.form';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CompList,
  CompListContents,
  expiryStatusColumn,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-insurance-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class InsuranceRegistrationsComponent extends BaseComponent {
  override title = 'Insurance Registrations Management';
  override subtitle = 'Insurance Registrations List';
  override actionButtons: ActionButton[] = [insuranceRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'nameOfAsset',
    'coverage',
    'department',
    'duration',
    // 'endDate',
    expiryStatusColumn('endDate'),
    'insuranceType',
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    reloadActions$: [insuranceRegistration$],
    actionButtons: insuranceRegistrationTableBtns(this),
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_INSURANCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_INSURANCE_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_INSURANCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_INSURANCE_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_INSURANCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_INSURANCE_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_INSURANCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_INSURANCE_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_INSURANCE_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_INSURANCE_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
