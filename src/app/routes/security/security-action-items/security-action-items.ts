import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_ACTION_ITEMS_PAGEABLE } from './security-action-item.graphql';
import {
  securityActionItemUpsertBtn,
  securityActionItemTableBtns,
  securityActionItem$,
} from './security-action-item.form';

@Component({
  selector: 'security-action-items',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityActionItems extends BaseComponent {
  override title = 'Security Action Items';
  override subtitle = 'Track action items from incidents and investigations';
  override actionButtons: ActionButton[] = [securityActionItemUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'observationReported',
    'priority',
    'status',
    'responsibleName',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Security Action Items',
    icon: 'task',
    keyColumns: this.keyColumns,
    actionButtons: securityActionItemTableBtns(this),
    reloadActions$: [securityActionItem$],
    fetchParameter: { query: ALL_SECURITY_ACTION_ITEMS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-action-items', data.uid),
      },
    ],
  };
}
