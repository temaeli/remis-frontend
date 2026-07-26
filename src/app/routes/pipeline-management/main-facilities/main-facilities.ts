import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GET_ALL_MAIN_FACILITIES_PAGEABLE } from './main-facility.graphql';
import {
  mainFacilityUpsertBtn,
  mainFacilityTableBtns,
  mainFacility$,
} from './main-facility.form';

@Component({
  selector: 'main-facilities',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class MainFacilities extends BaseComponent {
  override title = 'Main Facilities';
  override subtitle = 'Manage Main Facilities';
  override actionButtons: ActionButton[] = [mainFacilityUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    { field: 'type.name', header: 'Facility Type' },
    { field: 'createdAt', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Main Facilities',
    icon: 'factory',
    keyColumns: this.keyColumns,
    actionButtons: mainFacilityTableBtns(this),
    reloadActions$: [mainFacility$],
    fetchParameter: { query: GET_ALL_MAIN_FACILITIES_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    hasActionsColumn: true,
  };
}
