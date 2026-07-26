import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { GET_ALL_PLANT_FORM_GROUPS } from './plant-form-group.graphql';
import { plantFormGroupUpsertBtn } from './plant-form-group.form';
import { plantFormGroupTableBtns, plantFormGroup$ } from './plant-form-group.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-plant-form-groups',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PlantFormGroupsComponent extends BaseComponent {
  override title = 'Plant Form Groups Management';
  override subtitle = 'Plant Form Groups List';
  override actionButtons: ActionButton[] = [plantFormGroupUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['sno as S/No', 'name', 'inputType', 'actions'];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: plantFormGroupTableBtns(this),
    reloadActions$: [plantFormGroup$],
    fetchParameter: { query: GET_ALL_PLANT_FORM_GROUPS },
  };
}
