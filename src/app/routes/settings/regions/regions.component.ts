import { Component } from '@angular/core';
import { GET_ALL_REGIONS } from './region.graphql';
import { regionUpsertBtn } from './region.form';
import { regionTableBtns, region$ } from './region.form';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-regions',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3  ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class RegionsComponent extends BaseComponent {
  override title = 'Regions Management';
  override subtitle = 'Regions List';
  override actionButtons: ActionButton[] = [regionUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'name', 'code', 'napaId', 'actions'];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: regionTableBtns(this),
    reloadActions$: [region$],
    fetchParameter: { query: GET_ALL_REGIONS },
  };
}
