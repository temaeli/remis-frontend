import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_HSE_MEETINGS } from './meeting.graphql';
import { hseMeetingUpsertBtn, hseMeetingTableBtns, hseMeeting$ } from './meeting.form';
import { MEETING_CATEGORY_LABELS, MeetingCategory } from './meeting.interface';

@Component({
  selector: 'hse-meetings',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class HseMeetings extends BaseComponent {
  override title = 'HSE Meetings';
  override subtitle = 'Schedule and review HSE meetings';
  override actionButtons: ActionButton[] = [hseMeetingUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'title',
    {
      field: 'category',
      header: 'Category',
      valueFn: (row: any) =>
        row?.category ? (MEETING_CATEGORY_LABELS[row.category as MeetingCategory] ?? row.category) : '',
    },
    'organizer',
    'location',
    { field: 'startTime', type: 'dateTime' },
    { field: 'endTime', type: 'dateTime' },
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'HSE Meetings',
    icon: 'group',
    keyColumns: this.keyColumns,
    actionButtons: hseMeetingTableBtns(this),
    reloadActions$: [hseMeeting$],
    fetchParameter: { query: GET_ALL_HSE_MEETINGS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'meetings', data.uid),
      },
    ],
  };
}
