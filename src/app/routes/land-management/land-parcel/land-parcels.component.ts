import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { GET_LAND_PARCELS } from './land-parcel.graphql';
import { landParcelTableBtns, landParcelUpsertBtn, landParcel$ } from './land-parcel.form';

@Component({
  selector: 'app-land-parcels',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class LandParcelsComponent extends BaseComponent {
  override title = 'Land Parcels Management';
  override subtitle = 'Land Parcels List';
  override actionButtons: ActionButton[] = [landParcelUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'titleNumber', 'location', 'sizeSqm', 'actions'];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: landParcelTableBtns(this),
    reloadActions$: [landParcel$],
    fetchParameter: { query: GET_LAND_PARCELS },
  };
}
