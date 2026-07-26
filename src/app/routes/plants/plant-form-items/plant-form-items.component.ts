import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { GET_ALL_PLANT_FORM_ITEMS } from './plant-form-item.graphql';
import { plantFormItemUpsertBtn } from './plant-form-item.form';
import { plantFormItemTableBtns, plantFormItem$ } from './plant-form-item.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-plant-form-items',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PlantFormItemsComponent extends BaseComponent {
  override title = 'Plant Form Items Management';
  override subtitle = 'Plant Form Items List';
  override actionButtons: ActionButton[] = [plantFormItemUpsertBtn(this)];

  //   hasSpecification
  // maximumValue: Float
  // minimumValue: Float
  // specificationType: SpecificationType
  // unitOfMeasure: UnitOfMeasure

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    'unitOfMeasure',
    'group',
    'createdAt type(date)',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: plantFormItemTableBtns(this),
    reloadActions$: [plantFormItem$],
    fetchParameter: { query: GET_ALL_PLANT_FORM_ITEMS },
  };
}
