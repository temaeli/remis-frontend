import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_FORMS } from './security-form.graphql';
import { securityFormUpsertBtn, securityFormTableBtns, securityForm$ } from './security-form.form';

@Component({
  selector: 'security-forms',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityForms extends BaseComponent {
  override title = 'Security Forms';
  override subtitle = 'Manage Security Forms';
  override actionButtons: ActionButton[] = [securityFormUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'code', 'name', 'category', 'periodicity', 'actions'];

  gridParameter: GridParameter = {
    title: 'Security Forms',
    icon: 'document_settings',
    keyColumns: this.keyColumns,
    actionButtons: securityFormTableBtns(this),
    reloadActions$: [securityForm$],
    fetchParameter: { query: ALL_SECURITY_FORMS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-forms', data.uid),
      },
    ],
  };
}
