import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_INQUIRIES_PAGEABLE,
  MY_INQUIRIES_PAGEABLE,
  MY_INQUIRY_ASSIGNMENT_PAGEABLE,
  SUBMITTED_INQUIRIES_PAGEABLE,
} from './inquiry.graphql';
import { inquiryUpsertBtn } from './forms/inquiry.form';
import { inquiryTableBtns, inquiry$ } from './forms/inquiry.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-inquiries',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="block grow content" [contents]="contents" />
    </div>
  `,
})
export class InquiriesComponent extends BaseComponent {
  override title = 'Feedback / Complaint Management';
  override subtitle = 'Feedback / Complaint List';
  override actionButtons: ActionButton[] = [inquiryUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'clientName',
    'description',
    'priority',
    'ward',
    'status',
    'stage',
    // 'createdBy',
    'createdAt type(date)',
    'actions',
  ];

  contents: ContentParameter[] = [
    {
      type: 'table',
      slug: 'my-inquiries',
      icon: 'user',
      label: `My ${this.route.snapshot.data['name']}`,
      keyColumns: this.keyColumns,
      actionButtons: inquiryTableBtns(this),
      reloadActions$: [inquiry$],
      fetchParameter: { query: MY_INQUIRIES_PAGEABLE },
      permissions: ['ROLE_VIEW_INQUIRY'],
    },
    {
      type: 'table',
      slug: 'submitted-inquiries',
      icon: 'inbox',
      label: `Submitted ${this.route.snapshot.data['name']}`,
      keyColumns: this.keyColumns,
      actionButtons: inquiryTableBtns(this),
      reloadActions$: [inquiry$],
      fetchParameter: {
        query: SUBMITTED_INQUIRIES_PAGEABLE,
        searchStates: { status: 'OPEN' },
      },
      permissions: ['ROLE_VIEW_CONTROL_ROOM_INQUIRY'],
    },
    {
      type: 'table',
      slug: 'assigned-inquiries',
      icon: 'all',
      label: `Assigned ${this.route.snapshot.data['name']}`,
      keyColumns: [
        'sno as S/No',
        'comment truncate(60)',
        'current type(status)',
        'inquiry.status as Status',
        'inquiry.stage as Stage',
        'inquiry.clientName as Client',
        'createdAt type(date)',
        'actions',
      ],
      actionButtons: inquiryTableBtns(this),
      reloadActions$: [inquiry$],
      fetchParameter: {
        query: MY_INQUIRY_ASSIGNMENT_PAGEABLE,
        searchStates: { 'inquiry.status': 'OPEN' },
      },
      permissions: ['ROLE_VIEW_INQUIRY_ASSIGNMENT'],
    },
    {
      type: 'table',
      slug: 'all-inquiries',
      label: `All ${this.route.snapshot.data['name']}`,
      icon: this.route.snapshot.data['icon'],
      keyColumns: this.keyColumns,
      actionButtons: inquiryTableBtns(this),
      reloadActions$: [inquiry$],
      fetchParameter: { query: ALL_INQUIRIES_PAGEABLE },
      permissions: ['ROLE_VIEW_ALL_INQUIRY'],
    },
  ].map(
    (c) =>
      ({
        ...c,
        badge: ['all-inquiries', 'my-inquiries'].includes(c.slug)
          ? undefined
          : this.fs.fetch$(c.fetchParameter).pipe(map((res) => res?.totalElements ?? 0)),
        fetchParameter: { ...c.fetchParameter, loadingOn: 'content' },
      } as ContentParameter),
  );
}
