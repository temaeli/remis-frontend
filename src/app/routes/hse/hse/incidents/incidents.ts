import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_INCIDENTS, GET_MY_WORKSTATION_INCIDENTS } from './incident.graphql';
import { incidentUpsertBtn, incidentTableBtns, incident$ } from './incident.form';

@Component({
  selector: 'incidents',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Incidents extends BaseComponent {
  override title = 'Incident Reports';
  override subtitle = 'Manage Incident Reports';
  override actionButtons: ActionButton[] = [incidentUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'incidentType.name', header: 'Type' },
    { field: 'workStation.name', header: 'Station' },
    'location',
    { field: 'immediateCause', header: 'Immediate Cause' },
    { field: 'currentActor.actor', header: 'Current Actor' },
    { field: 'timeHappened', type: 'dateTime' },
    'actions',
  ];

  private canViewAll = HasPermissionDirective.hasPermission(['ROLE_VIEW_INCIDENT']);

  private allOption = {
    title: 'All Incidents',
    label: 'All',
    fetchParameter: { query: GET_ALL_INCIDENTS },
  };
  private mineOption = {
    title: 'My Workstation Incidents',
    label: 'My Workstations',
    fetchParameter: { query: GET_MY_WORKSTATION_INCIDENTS },
  };

  gridParameter: GridParameter = {
    title: 'Incidents',
    icon: 'warning',
    keyColumns: this.keyColumns,
    actionButtons: incidentTableBtns(this),
    reloadActions$: [incident$],
    fetchParameter: this.canViewAll
      ? this.allOption.fetchParameter
      : this.mineOption.fetchParameter,
    // Default: elevated view (ROLE_VIEW_INCIDENT) starts on All;
    // everyone else lands on My Workstations. Both BE ops are
    // gated on @SecurityService.isInternalStaff(), so non-staff
    // won't get results either way.
    gridOptions: this.canViewAll
      ? [this.allOption, this.mineOption]
      : [this.mineOption, this.allOption],
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'incidents', data.uid),
      },
    ],
  };
}
