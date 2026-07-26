import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_CONTRACTORS } from './security-contractor.graphql';
import {
  securityContractorUpsertBtn,
  securityContractorTableBtns,
  securityContractor$,
} from './security-contractor.form';

@Component({
  selector: 'security-contractors',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityContractors extends BaseComponent {
  override title = 'Security Contractors';
  override subtitle = 'Manage Security Contractors';
  override actionButtons: ActionButton[] = [securityContractorUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'code', 'name', 'description', 'actions'];

  gridParameter: GridParameter = {
    title: 'Security Contractors',
    icon: 'category',
    keyColumns: this.keyColumns,
    actionButtons: securityContractorTableBtns(this),
    reloadActions$: [securityContractor$],
    fetchParameter: { query: ALL_SECURITY_CONTRACTORS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-contractors', data.uid),
      },
    ],
  };
}
