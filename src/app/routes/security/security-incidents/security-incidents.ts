import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_INCIDENTS_PAGEABLE } from './security-incident.graphql';
import {
  securityIncidentUpsertBtn,
  securityIncidentTableBtns,
  securityIncident$,
} from './security-incident.form';

@Component({
  selector: 'security-incidents',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityIncidents extends BaseComponent {
  override title = 'Security Incidents';
  override subtitle = 'Report and manage security incidents';
  override actionButtons: ActionButton[] = [securityIncidentUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'referenceNumber',
    'incidentDate',
    'location',
    'severity',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Security Incidents',
    icon: 'report',
    keyColumns: this.keyColumns,
    actionButtons: securityIncidentTableBtns(this),
    reloadActions$: [securityIncident$],
    fetchParameter: { query: ALL_SECURITY_INCIDENTS_PAGEABLE },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-incidents', data.uid),
      },
    ],
  };
}
