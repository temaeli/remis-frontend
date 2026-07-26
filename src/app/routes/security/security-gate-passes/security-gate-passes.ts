import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_GATE_PASSES_PAGEABLE } from './security-gate-pass.graphql';
import {
  securityGatePassUpsertBtn,
  securityGatePassTableBtns,
  securityGatePass$,
} from './security-gate-pass.form';

@Component({
  selector: 'security-gate-passes',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityGatePasses extends BaseComponent {
  override title = 'Gate Passes';
  override subtitle = 'Manage material gate passes';
  override actionButtons: ActionButton[] = [securityGatePassUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'referenceNumber',
    'company',
    'vehicleNo',
    'passDate',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Gate Passes',
    icon: 'badge',
    keyColumns: this.keyColumns,
    actionButtons: securityGatePassTableBtns(this),
    reloadActions$: [securityGatePass$],
    fetchParameter: { query: ALL_SECURITY_GATE_PASSES_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-gate-passes', data.uid),
      },
    ],
  };
}
