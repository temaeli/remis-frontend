import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_OPINION_REGISTRATIONS_PAGEABLE,
  GET_GENERAL_MANAGER_OPINION_REGISTRATIONS_PAGEABLE,
  GET_HEAD_OF_DEPARTMENT_OPINION_REGISTRATIONS_PAGEABLE,
  GET_OFFICER_OPINION_REGISTRATIONS_PAGEABLE,
  MY_OPINION_REGISTRATIONS_PAGEABLE,
} from './opinion-registration.graphql';
import { opinionRegistrationUpsertBtn } from './opinion-registration.form';
import { opinionRegistrationTableBtns, opinionRegistration$ } from './opinion-registration.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  CompList,
  CompListContents,
  mapComplianceListContent,
} from '../compliance-common/compliance-common';

@Component({
  selector: 'app-opinion-registrations',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class OpinionRegistrationsComponent extends BaseComponent {
  override title = 'Opinion Registrations Management';
  override subtitle = 'Opinion Registrations List';
  override actionButtons: ActionButton[] = [opinionRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'name',
    'nature',
    'responsibleUnit',
    'valueObtained',
    'stage',
    'actions',
  ];

  content: Partial<ContentParameter> = {
    keyColumns: this.keyColumns,
    actionButtons: opinionRegistrationTableBtns(this),
    reloadActions$: [opinionRegistration$],
  };

  contents: ContentParameter[] = [
    {
      ...CompListContents[CompList.OFFICER],
      fetchParameter: { query: GET_OFFICER_OPINION_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_OPINION_REGISTRATION_AS_OFFICER'],
    },
    {
      ...CompListContents[CompList.HOD],
      fetchParameter: { query: GET_HEAD_OF_DEPARTMENT_OPINION_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_OPINION_REGISTRATION_AS_HOD'],
    },
    {
      ...CompListContents[CompList.GENERAL_MANAGER],
      fetchParameter: { query: GET_GENERAL_MANAGER_OPINION_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_PROCESS_OPINION_REGISTRATION_AS_GM'],
    },
    {
      ...CompListContents[CompList.MY],
      fetchParameter: { query: MY_OPINION_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_CREATE_OPINION_REGISTRATION'],
    },
    {
      ...CompListContents[CompList.ALL],
      fetchParameter: { query: ALL_OPINION_REGISTRATIONS_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_OPINION_REGISTRATION'],
    },
  ].map((c) => mapComplianceListContent(this, { ...c, ...this.content }));
}
