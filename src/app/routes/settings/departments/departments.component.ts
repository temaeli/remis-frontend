import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ALL_DEPARTMENTS_PAGEABLE } from './department.graphql';
import { departmentUpsertBtn } from './department.form';
import { departmentTableBtns, department$ } from './department.form';

@Component({
  selector: 'app-departments',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class DepartmentsComponent extends BaseComponent {
  override title = 'Departments Management';
  override subtitle = 'Departments List';
  override actionButtons: ActionButton[] = [departmentUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'name', 'code', 'actions'];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: departmentTableBtns(this),
    reloadActions$: [department$],
    fetchParameter: { query: ALL_DEPARTMENTS_PAGEABLE },
  };
}
