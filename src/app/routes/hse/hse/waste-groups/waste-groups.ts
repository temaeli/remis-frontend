import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_WASTE_GROUPS } from './waste-group.graphql';
import { wasteGroupUpsertBtn, wasteGroupTableBtns, wasteGroup$ } from './waste-group.form';

@Component({
  selector: 'waste-groups',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class WasteGroups extends BaseComponent {
  override title = 'Waste Groups';
  override subtitle = 'Manage Waste Groups';
  override actionButtons: ActionButton[] = [wasteGroupUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'code', 'name', 'description', 'actions'];

  gridParameter: GridParameter = {
    title: 'Waste Groups',
    icon: 'delete',
    keyColumns: this.keyColumns,
    actionButtons: wasteGroupTableBtns(this),
    reloadActions$: [wasteGroup$],
    fetchParameter: { query: GET_ALL_WASTE_GROUPS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'waste-groups', data.uid),
      },
    ],
  };
}
