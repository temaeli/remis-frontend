import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_ACCESS_EVENTS_PAGEABLE } from './security-access-event.graphql';
import {
  securityAccessEventUpsertBtn,
  securityAccessEventTableBtns,
  securityAccessEvent$,
} from './security-access-event.form';

@Component({
  selector: 'security-access-events',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityAccessEvents extends BaseComponent {
  override title = 'Access Control Events';
  override subtitle = 'Log site access and gate entry events';
  override actionButtons: ActionButton[] = [securityAccessEventUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'personName',
    'personType',
    'result',
    'eventTime',
    'authorizedBy',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Access Control Events',
    icon: 'meeting_room',
    keyColumns: this.keyColumns,
    actionButtons: securityAccessEventTableBtns(this),
    reloadActions$: [securityAccessEvent$],
    fetchParameter: { query: ALL_SECURITY_ACCESS_EVENTS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-access-events', data.uid),
      },
    ],
  };
}
