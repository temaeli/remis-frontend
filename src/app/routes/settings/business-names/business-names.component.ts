import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_BUSINESS_NAMES_PAGEABLE } from './business-name.graphql';
import { businessNameUpsertBtn, businessNameTableBtns, businessName$ } from './business-name.form';

@Component({
  selector: 'app-business-names',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class BusinessNamesComponent extends BaseComponent {
  override title = 'Business Names';
  override subtitle = 'Organisations and other named entities on the register';
  override actionButtons: ActionButton[] = [businessNameUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    {
      field: 'isPublic',
      header: 'Public',
      valueFn: (row) => (row?.isPublic ? 'Yes' : 'No'),
      valueClassMapper: (row) => (row?.isPublic ? 'text-success' : 'text-danger'),
    },
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
    actionButtons: businessNameTableBtns(this),
    reloadActions$: [businessName$],
    fetchParameter: { query: ALL_BUSINESS_NAMES_PAGEABLE },
  };
}
