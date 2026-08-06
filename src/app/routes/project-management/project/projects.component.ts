import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_REGISTRY_PROJECTS_PAGEABLE } from './project.graphql';
import { registryProjectUpsertBtn, registryProjectTableBtns, registryProject$ } from './project.form';

@Component({
  selector: 'app-projects',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class RegistryProjectsComponent extends BaseComponent {
  override title = 'Projects';
  override subtitle = 'The central project register';
  override actionButtons: ActionButton[] = [registryProjectUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'projectSubcategory.name as Subcategory',
    'days',
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
    actionButtons: registryProjectTableBtns(this),
    reloadActions$: [registryProject$],
    fetchParameter: { query: ALL_REGISTRY_PROJECTS_PAGEABLE },
  };
}
