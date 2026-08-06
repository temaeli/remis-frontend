import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { LIST_USERS_PAGEABLE } from './user.graphql';
import { userUpsertBtn, userTableBtns, user$ } from './user.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchCombinationType } from '@shared/fetch/fetch.interface';
import { getDisplayName } from '@core/helpers/view.helpers';
import { replaceWords } from '@core/helpers';

@Component({
  selector: 'app-users',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Users extends BaseComponent {
  override title = 'Users Management';
  override subtitle = 'Users List';
  override actionButtons: ActionButton[] = [userUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'bioData.firstName as First Name filter(true) sortable(true)',
    'bioData.thirdName as Last Name filter(true) sortable(true)',
    'email filter(true) sortable(true)',

    {
      field: 'rolesList',
      header: 'Roles',
      valueFn: (r) => r?.rolesList?.map((x: any) => getDisplayName(x.role?.name)),
    },
    {
      field: 'active',
      valueFn: (row) => (row?.active ? 'Active' : 'Inactive'),
      valueClassMapper: (row) => (row?.active ? 'text-success' : 'text-danger'),
    },
    {
      field: 'isStaff',
      valueFn: (row) => (row?.isStaff ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.isStaff ? 'text-success' : 'text-danger'),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: userTableBtns(this),
    reloadActions$: [user$],
    searchCombinationType: SearchCombinationType.Or,
    fetchParameter: { query: LIST_USERS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    // Keep the search box visible on the "In Active" toggle even when there
    // are too few inactive users to trigger the grid's normal pageSize-based
    // auto-show threshold.
    forceShowSearchInput: true,
  };
}
