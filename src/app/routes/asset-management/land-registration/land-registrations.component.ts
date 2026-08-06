import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_LAND_REGISTRATIONS_PAGEABLE } from './land-registration.graphql';
import {
  landRegistration$,
  landRegistrationTableBtns,
  landRegistrationUpsertBtn,
} from './land-registration.form';

@Component({
  selector: 'app-land-registrations',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class LandRegistrationsComponent extends BaseComponent {
  override title = 'Land Registrations';
  override subtitle = 'Registrations held against land assets';
  override actionButtons: ActionButton[] = [landRegistrationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'asset.name as Asset',
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
    actionButtons: landRegistrationTableBtns(this),
    reloadActions$: [landRegistration$],
    fetchParameter: { query: ALL_LAND_REGISTRATIONS_PAGEABLE },
  };
}
