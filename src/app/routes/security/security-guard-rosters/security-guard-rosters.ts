import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_GUARD_ROSTERS_PAGEABLE } from './security-guard-roster.graphql';
import {
  securityGuardRosterUpsertBtn,
  securityGuardRosterTableBtns,
  securityGuardRoster$,
} from './security-guard-roster.form';

@Component({
  selector: 'security-guard-rosters',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityGuardRosters extends BaseComponent {
  override title = 'Guard Rosters';
  override subtitle = 'Plan weekly guard duty rosters';
  override actionButtons: ActionButton[] = [securityGuardRosterUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'referenceNumber as Roaster No',
    'weekStart',
    'weekEnd',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Guard Rosters',
    icon: 'calendar_month',
    keyColumns: this.keyColumns,
    actionButtons: securityGuardRosterTableBtns(this),
    reloadActions$: [securityGuardRoster$],
    fetchParameter: { query: ALL_SECURITY_GUARD_ROSTERS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-guard-rosters', data.uid),
      },
    ],
  };
}
