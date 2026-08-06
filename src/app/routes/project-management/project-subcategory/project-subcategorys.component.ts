import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_PROJECT_SUBCATEGORIES_PAGEABLE } from './project-subcategory.graphql';
import { projectSubcategoryUpsertBtn, projectSubcategoryTableBtns, projectSubcategory$ } from './project-subcategory.form';

@Component({
  selector: 'app-project-subcategorys',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class ProjectSubcategorysComponent extends BaseComponent {
  override title = 'Project Subcategories';
  override subtitle = 'Divisions of a project category';
  override actionButtons: ActionButton[] = [projectSubcategoryUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'projectCategory.name as Category',
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
    actionButtons: projectSubcategoryTableBtns(this),
    reloadActions$: [projectSubcategory$],
    fetchParameter: { query: ALL_PROJECT_SUBCATEGORIES_PAGEABLE },
  };
}
