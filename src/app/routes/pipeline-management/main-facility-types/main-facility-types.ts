import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GET_ALL_MAIN_FACILITY_TYPES_PAGEABLE } from './main-facility-type.graphql';
import {
  mainFacilityTypeUpsertBtn,
  mainFacilityTypeTableBtns,
  mainFacilityType$,
} from './main-facility-type.form';

@Component({
  selector: 'main-facility-types',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class MainFacilityTypes extends BaseComponent {
  override title = 'Main Facility Types';
  override subtitle = 'Manage Main Facility Types';
  override actionButtons: ActionButton[] = [mainFacilityTypeUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    'description',
    { field: 'createdAt', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Main Facility Types',
    icon: 'settings',
    keyColumns: this.keyColumns,
    actionButtons: mainFacilityTypeTableBtns(this),
    reloadActions$: [mainFacilityType$],
    fetchParameter: { query: GET_ALL_MAIN_FACILITY_TYPES_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    hasActionsColumn: true,
  };
}
