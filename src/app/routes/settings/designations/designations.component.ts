import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ALL_DESIGNATIONS } from './designations.graphql';
import {
  designationUpsertBtn,
  designationTableBtns,
  designation$,
} from './designations.form';

@Component({
  selector: 'app-designations',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class DesignationsComponent extends BaseComponent {
  override title = 'Designations';
  override subtitle = 'Designations Management';
  override actionButtons: ActionButton[] = [
    designationUpsertBtn(this),
  ];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'title',
    'active',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: designationTableBtns(this),
    reloadActions$: [designation$],
    fetchParameter: { query: ALL_DESIGNATIONS },
  };
}
