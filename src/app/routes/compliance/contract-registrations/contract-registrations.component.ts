import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_CONTRACT_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_CONTRACT_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_CONTRACT_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_CONTRACT_REGISTRATIONS_PAGEABLE,
  MY_CONTRACT_REGISTRATIONS_PAGEABLE,
} from './contract-registration.graphql';
import { contractRegistrationUpsertBtn } from './contract-registration.form';
import { contractRegistrationTableBtns, contractRegistration$ } from './contract-registration.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  CompList,
  CompListContents,
  expiryStatusColumn,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-contract-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class ContractRegistrationsComponent extends BaseComponent {
  override title = 'Contract Registrations Management';
  override subtitle = 'Contract Registrations List';
  override actionButtons: ActionButton[] = [contractRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'amount type(number)',
    'contractManager',
    'contractNumber',
    'contractType',
    'contractDate',
    // 'endDate',
    expiryStatusColumn('endDate'),
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    reloadActions$: [contractRegistration$],
    actionButtons: contractRegistrationTableBtns(this),
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_CONTRACT_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_CONTRACT_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_CONTRACT_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_CONTRACT_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_CONTRACT_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_CONTRACT_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_CONTRACT_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_CONTRACT_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_CONTRACT_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_CONTRACT_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
