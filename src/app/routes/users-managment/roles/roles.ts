import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { LIST_ALL_ROLES } from './role.graphql';
import { roleUpsertBtn, roleTableBtns, role$ } from './role.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { truncate } from '@core/helpers';
import { getDisplayName } from '@core/helpers/view.helpers';

@Component({
  selector: 'app-roles',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Roles extends BaseComponent {
  override title = 'Roles Management';
  override subtitle = 'Roles List';
  override actionButtons: ActionButton[] = [roleUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index as S/N',
    {
      field: 'name',
      valueFn: (row) => row?.name?.replaceAll('_', ' '),
      sortable: true,
    },
    'description ',

    {
      field: 'permissionList',
      header: 'Permissions',
      type: 'html',
      valueFn: (r) => {
        const items = r.permissionList ?? [];
        if (!items.length) return '--';

        //prettier-ignore
        const str = `<span class="opacity-80 text-sm"> ${items.slice(0, 3).map((i: any) => i.displayName).join(', ')}</span>`;
        return items.length > 4 ? `${str} <i class='text-primary'> +${items.length - 3}</i>` : str;
      },
    },
    {
      field: 'active',
      valueFn: (row) => (row?.active ? 'Active' : 'Inactive'),
      valueClassMapper: (row) => (row?.active ? 'text-success' : 'text-danger'),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: roleTableBtns(this),
    reloadActions$: [role$],
    fetchParameter: { query: LIST_ALL_ROLES },
    isPageable: false,
    gridOptions: DEFAULT_TABLE_OPTIONS,
  };
}
