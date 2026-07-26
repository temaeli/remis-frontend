import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ALL_SECURITY_INCIDENT_TYPES } from './security-incident-type.graphql';
import {
  securityIncidentTypeUpsertBtn,
  securityIncidentTypeTableBtns,
  securityIncidentType$,
} from './security-incident-type.form';

@Component({
  selector: 'security-incident-types',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SecurityIncidentTypes extends BaseComponent {
  override title = 'Security Incident Types';
  override subtitle = 'Manage Security Incident Types';
  override actionButtons: ActionButton[] = [securityIncidentTypeUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = ['index', 'code', 'name', 'description', 'actions'];

  gridParameter: GridParameter = {
    title: 'Security Incident Types',
    icon: 'category',
    keyColumns: this.keyColumns,
    actionButtons: securityIncidentTypeTableBtns(this),
    reloadActions$: [securityIncidentType$],
    fetchParameter: { query: ALL_SECURITY_INCIDENT_TYPES },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'security-incident-types', data.uid),
      },
    ],
  };
}
