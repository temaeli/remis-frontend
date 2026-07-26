import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_INVESTIGATIONS_PAGEABLE } from './security-investigation.graphql';
import {
  securityInvestigationUpsertBtn,
  securityInvestigationTableBtns,
  securityInvestigation$,
} from './security-investigation.form';

@Component({
  selector: 'security-investigations',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityInvestigations extends BaseComponent {
  override title = 'Security Investigations';
  override subtitle = 'Manage incident investigations';
  override actionButtons: ActionButton[] = [securityInvestigationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'referenceNumber',
    'investigationType',
    'investigationDate',
    'subjectPerson',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Security Investigations',
    icon: 'policy',
    keyColumns: this.keyColumns,
    actionButtons: securityInvestigationTableBtns(this),
    reloadActions$: [securityInvestigation$],
    fetchParameter: { query: ALL_SECURITY_INVESTIGATIONS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-investigations', data.uid),
      },
    ],
  };
}
