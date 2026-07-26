import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ALL_SECURITY_GUARDS_PAGEABLE } from './security-guard.graphql';
import {
  securityGuardUpsertBtn,
  securityGuardTableBtns,
  securityGuard$,
} from './security-guard.form';

@Component({
  selector: 'security-guards',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityGuards extends BaseComponent {
  override title = 'Security Guards';
  override subtitle = 'Manage Security Guards';
  override actionButtons: ActionButton[] = [securityGuardUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'fullName',
    'rank',
    'serviceNumber',
    'contact',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Security Guards',
    icon: 'local_police',
    keyColumns: this.keyColumns,
    actionButtons: securityGuardTableBtns(this),
    reloadActions$: [securityGuard$],
    fetchParameter: { query: ALL_SECURITY_GUARDS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
  };
}
