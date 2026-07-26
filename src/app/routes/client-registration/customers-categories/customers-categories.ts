import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ALL_CUSTOMER_CATEGORIES_PAGEABLE } from './customers-categories.graphql';
import {
  customerCategory$,
  customerCategoryTableBtns,
  customerCategoryUpsertBtn,
} from './customers-categories.form';

@Component({
  selector: 'app-customer-categories',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class CustomerCategories extends BaseComponent {
  override title = 'Customer Categories';
  override subtitle = 'Customer Categories Management';
  override actionButtons: ActionButton[] = [customerCategoryUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'name', 'code', 'description', 'actions'];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: customerCategoryTableBtns(this),
    reloadActions$: [customerCategory$],
    fetchParameter: {
      query: ALL_CUSTOMER_CATEGORIES_PAGEABLE,
    },
  };
}
