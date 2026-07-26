import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_INCIDENT_TYPES } from './incident-type.graphql';
import {
  incidentTypeUpsertBtn,
  incidentTypeTableBtns,
  incidentType$,
} from './incident-type.form';

@Component({
  selector: 'incident-types',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class IncidentTypes extends BaseComponent {
  override title = 'Incident Types';
  override subtitle = 'Manage Incident Types';
  override actionButtons: ActionButton[] = [incidentTypeUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    'description',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Incident Types',
    icon: 'category',
    keyColumns: this.keyColumns,
    actionButtons: incidentTypeTableBtns(this),
    reloadActions$: [incidentType$],
    fetchParameter: { query: GET_ALL_INCIDENT_TYPES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'incident-types', data.uid),
      },
    ],
  };
}
