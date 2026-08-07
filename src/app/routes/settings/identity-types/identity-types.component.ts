import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_IDENTITY_TYPES_PAGEABLE } from './identity-type.graphql';
import { identityTypeUpsertBtn, identityTypeTableBtns, identityType$ } from './identity-type.form';

@Component({
  selector: 'app-identity-types',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class IdentityTypesComponent extends BaseComponent {
  override title = 'Identity Types';
  override subtitle = 'How people and organisations on the register are identified';
  override actionButtons: ActionButton[] = [identityTypeUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    {
      field: 'active',
      valueFn: (row) => (row?.active ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.active ? 'text-success' : 'text-danger'),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    isPageable: true,
    actionButtons: identityTypeTableBtns(this),
    reloadActions$: [identityType$],
    fetchParameter: { query: ALL_IDENTITY_TYPES_PAGEABLE },
  };
}
