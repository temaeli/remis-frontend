import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_REGISTRY_MASTER_PLANS_PAGEABLE } from './master-plan.graphql';
import { registryMasterPlanUpsertBtn, registryMasterPlanTableBtns, registryMasterPlan$ } from './master-plan.form';

@Component({
  selector: 'app-master-plans',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class RegistryMasterPlansComponent extends BaseComponent {
  override title = 'Master Plans';
  override subtitle = 'Planned areas with a survey point';
  override actionButtons: ActionButton[] = [registryMasterPlanUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'area',
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
    actionButtons: registryMasterPlanTableBtns(this),
    reloadActions$: [registryMasterPlan$],
    fetchParameter: { query: ALL_REGISTRY_MASTER_PLANS_PAGEABLE },
  };
}
