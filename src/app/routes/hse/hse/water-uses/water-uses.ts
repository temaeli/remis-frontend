import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_WATER_USES } from './water-use.graphql';
import { waterUseUpsertBtn, waterUseTableBtns, waterUse$ } from './water-use.form';

@Component({
  selector: 'water-uses',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class WaterUses extends BaseComponent {
  override title = 'Water Uses';
  override subtitle = 'Manage Water Uses';
  override actionButtons: ActionButton[] = [waterUseUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'code', 'name', 'description', 'actions'];

  gridParameter: GridParameter = {
    title: 'Water Uses',
    icon: 'water',
    keyColumns: this.keyColumns,
    actionButtons: waterUseTableBtns(this),
    reloadActions$: [waterUse$],
    fetchParameter: { query: GET_ALL_WATER_USES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'water-uses', data.uid),
      },
    ],
  };
}
