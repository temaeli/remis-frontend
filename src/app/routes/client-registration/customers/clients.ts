import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  ALL_CLIENT_PAGEABLE,
  PENDING_CLIENT_REGISTRATIONS,
  CLIENT_BY_STREAM_TYPE_PAGEABLE,
} from './clients.graphql';
import { clientUpsertBtn, clientTableBtns, approveClientBtn, client$ } from './clients.form';
import { ClientStreamType } from './clients.interface';

@Component({
  selector: 'app-clients',
  imports: [DataGridComponent, PageHeaderComponent, MatTabGroup, MatTab],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />

      <mat-tab-group class="grow flex flex-col" dynamicHeight>
        <mat-tab label="All Customers">
          <data-grid class="mt-3 flex flex-col" theme="simple" [gridParameter]="gridParameter" />
        </mat-tab>
        <mat-tab label="Upstream Customers">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="upstreamGridParameter"
          />
        </mat-tab>
        <mat-tab label="Downstream Customers">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="downstreamGridParameter"
          />
        </mat-tab>
        <mat-tab label="Pending Registrations">
          <div class="mt-3 flex flex-col gap-2">
            <data-grid theme="simple" [gridParameter]="pendingGridParameter" />
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class Clients extends BaseComponent {
  override title = 'Customers Management';
  override subtitle = 'Customers List';
  override actionButtons: ActionButton[] = [clientUpsertBtn(this)];
  pendingActionButtons: ActionButton[] = [approveClientBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index as (S/N)',
    'user.fullName as Name',
    'accountNumber as Account Number',
    'plant.name as Plant',
    'email as Email',
    'approvalStatus as Status',
    'actions as Actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: clientTableBtns(this),
    reloadActions$: [client$],
    fetchParameter: {
      query: ALL_CLIENT_PAGEABLE,
      variables: { pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' } },
    },
  };

  upstreamGridParameter: GridParameter = {
    title: 'Upstream Clients',
    keyColumns: this.keyColumns,
    actionButtons: clientTableBtns(this),
    reloadActions$: [client$],
    fetchParameter: {
      query: CLIENT_BY_STREAM_TYPE_PAGEABLE,
      variables: {
        clientStreamType: ClientStreamType.UP,
        active: true,
        pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
      },
    },
  };

  downstreamGridParameter: GridParameter = {
    title: 'Downstream Clients',
    keyColumns: [
      'index as (S/N)',
      'user.fullName as Name',
      'email as Email',
      'pipelineSegment.segmentId as Pipeline Segment',
      'approvalStatus as Status',
      'actions as Actions',
    ],
    actionButtons: clientTableBtns(this),
    reloadActions$: [client$],
    fetchParameter: {
      query: CLIENT_BY_STREAM_TYPE_PAGEABLE,
      variables: {
        clientStreamType: ClientStreamType.DOWN,
        active: true,
        pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
      },
    },
  };

  pendingGridParameter: GridParameter = {
    title: 'Pending Registrations',
    keyColumns: [
      'index as (S/N)',
      'user.fullName as Name',
      'email as Email',
      'clientStreamType as Stream Type',
      'approvalStatus as Approval Status',
      'actions as Actions',
    ],
    actionButtons: [approveClientBtn(this)],
    reloadActions$: [client$],
    isPageable: false,
    fetchParameter: { query: PENDING_CLIENT_REGISTRATIONS },
  };
}
