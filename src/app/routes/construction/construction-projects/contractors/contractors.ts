import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ALL_CONTRACTORS } from '../construction-projects.graphql';
import { contractorUpsertBtn, contractorTableBtns, contractor$ } from './contractor.form';

@Component({
  selector: 'app-contractors',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Contractors extends BaseComponent {
  override title = 'Contractors';
  override subtitle = 'Construction contractors, reusable across projects';
  override actionButtons: ActionButton[] = [contractorUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    'contactPerson',
    'phone',
    'email',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.title,
    icon: 'category',
    keyColumns: this.keyColumns,
    actionButtons: contractorTableBtns(this),
    reloadActions$: [contractor$],
    fetchParameter: { query: ALL_CONTRACTORS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
  };
}
