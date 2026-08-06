import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_PROJECT_CONNECTIONS_PAGEABLE } from './project-connection.graphql';
import { projectConnectionUpsertBtn, projectConnectionTableBtns, projectConnection$ } from './project-connection.form';

@Component({
  selector: 'app-project-connections',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class ProjectConnectionsComponent extends BaseComponent {
  override title = 'Project Connections';
  override subtitle = 'Directed links between projects';
  override actionButtons: ActionButton[] = [projectConnectionUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'parent.name as Parent',
    'child.name as Child',
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
    actionButtons: projectConnectionTableBtns(this),
    reloadActions$: [projectConnection$],
    fetchParameter: { query: ALL_PROJECT_CONNECTIONS_PAGEABLE },
  };
}
