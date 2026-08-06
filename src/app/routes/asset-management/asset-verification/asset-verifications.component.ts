import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';

import { ALL_ASSET_VERIFICATIONS_PAGEABLE } from './asset-verification.graphql';
import {
  assetVerification$,
  assetVerificationTableBtns,
  assetVerificationUpsertBtn,
} from './asset-verification.form';

@Component({
  selector: 'app-asset-verifications',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class AssetVerificationsComponent extends BaseComponent {
  override title = 'Asset Verifications';
  override subtitle = 'Verifications recorded against assets';
  override actionButtons: ActionButton[] = [assetVerificationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'assignedNumber',
    'name',
    'description',
    'createdAt',
    'active',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    isPageable: true,
    actionButtons: assetVerificationTableBtns(this),
    reloadActions$: [assetVerification$],
    fetchParameter: { query: ALL_ASSET_VERIFICATIONS_PAGEABLE },
  };
}
