import { Component, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map } from 'rxjs';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ALL_NOMINATION_BATCHES } from '../nomination-batches/nomination-batch.graphql';
import {
  ALL_GAS_NOMINATIONS_PAGEABLE,
  GAS_NOMINATIONS_BY_STATUS_PAGEABLE,
} from './gas-nomination.graphql';
import { NominationStatus } from './gas-nomination.interface';
import {
  aggregateNominationsBtn,
  nominationBatch$,
  nominationBatchTableBtns,
  nominationBatchHeaderBtns,
  batchTableBtns,
} from '../nomination-batches/nomination-batch.form';

@Component({
  selector: 'app-gas-nomination-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataGridComponent, MatTabGroup, MatTab],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header title="Nomination" subtitle="All Nominations" [actionButtons]="actionButtons" />

      <mat-tab-group class="grow flex flex-col" dynamicHeight>
        @if (canViewAllNominations()) {
          <mat-tab label="Pending Nominations">
            <data-grid
              class="mt-3 flex flex-col"
              theme="simple"
              [gridParameter]="allNominationsGridParameter"
            />
          </mat-tab>
        }
        <!-- <mat-tab label="Sent to Pipeline Manager">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="sentToPipelineManagerGridParameter"
          />
        </mat-tab>
        <mat-tab label="Sent to Plant Shift Supervisor">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="sentToPlantShiftSupervisorGridParameter"
          />
        </mat-tab> -->
        <mat-tab label="Nominations Batches">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="batchesGridParameter"
          />
        </mat-tab>

        <mat-tab label="Batch Items">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="batchItemsGridParameter"
          />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class Internal extends BaseComponent {
  selectedBatchUid$ = new BehaviorSubject<string | null>(null);

  canViewAllNominations = toSignal(
    this.auth.user$.pipe(
      map((u) => {
        const perms: string[] = u?.permissions ?? [];
        return perms.includes('VIEW_ALL_GAS_NOMINATION') ||
          perms.includes('ROLE_VIEW_ALL_GAS_NOMINATION');
      }),
    ),
    { initialValue: false },
  );

  override actionButtons: ActionButton[] = [
    ...nominationBatchHeaderBtns(this),
  ];

  keyColumns: GridKeyColumn[] = [
    'index',
    'client.user.fullName as Client',
    'referenceNumber',
    'quantityMmscfd',
    'nominationDate',
    'status',
    'startDate',
    'endDate',
    'actions',
  ];

  allNominationsGridParameter: GridParameter = {
    title: 'All Nominations',
    icon: 'petroleum',
    keyColumns: this.keyColumns,
    isPageable: false,
    actionButtons: nominationBatchTableBtns(this),
    reloadActions$: [nominationBatch$],
    fetchParameter: {
      query: ALL_GAS_NOMINATIONS_PAGEABLE,
      variables: { pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' }, active: true },
    },
  };

  sentToPlantShiftSupervisorGridParameter: GridParameter = {
    title: 'Sent to Plant Shift Supervisor',
    icon: 'petroleum',
    keyColumns: this.keyColumns,
    isPageable: false,
    actionButtons: nominationBatchTableBtns(this),
    reloadActions$: [nominationBatch$],
    fetchParameter: {
      query: GAS_NOMINATIONS_BY_STATUS_PAGEABLE,
      variables: {
        status: NominationStatus.SENT_TO_PLANT_SHIFT_SUPERVISOR,
        pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
        active: true,
      },
    },
  };

  sentToPipelineManagerGridParameter: GridParameter = {
    title: 'Sent to Pipeline Manager',
    icon: 'petroleum',
    keyColumns: this.keyColumns,
    isPageable: false,
    actionButtons: nominationBatchTableBtns(this),
    reloadActions$: [nominationBatch$],
    fetchParameter: {
      query: GAS_NOMINATIONS_BY_STATUS_PAGEABLE,
      variables: {
        status: NominationStatus.SENT_TO_PIPELINE_MANAGER,
        pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
        active: true,
      },
    },
  };

  batchesGridParameter: GridParameter = {
    title: 'All Nominations Batches',
    icon: 'petroleum',
    keyColumns: [
      'index as (S/N)',
      'referenceNumber',
      'totalDemandMmscfd',
      'nominationDate',
      {
        field: 'status',
        valueFn: (row) => row?.status?.replace(/_/g, ' ') || row?.status,
      },
      'startDate',
      'endDate',
      'actions',
    ],
    isPageable: false,
    actionButtons: batchTableBtns(this, (uid) => this.selectedBatchUid$.next(uid)),
    reloadActions$: [nominationBatch$],
    fetchParameter: {
      query: ALL_NOMINATION_BATCHES,
    },
  };

  batchItemsGridParameter: GridParameter = {
    title: 'Batch Items',
    icon: 'petroleum',
    keyColumns: [
      'index as (S/N)',
      'referenceNumber as Batch',
      'nominationDate as Date',
      'plantNominations.plant.name as Plant',
      'totalDemandMmscfd as Total Demand (MMscfd)',
      'totalDemandSm3PerDay as Total Demand (Sm³/day)',
      'totalHourlyFlowSm3PerHour as Hourly Flow (Sm³/hr)',
      'status',
    ],
    isPageable: false,
    reloadActions$: [nominationBatch$, this.selectedBatchUid$],
    fetchParameter: { query: ALL_NOMINATION_BATCHES },
    onLoadDataFn: (batches: any[]) => {
      const uid = this.selectedBatchUid$.value;
      if (!uid) return [];
      const batch = (batches ?? []).find((b: any) => b?.uid === uid);
      return (batch?.items ?? []).map((item: any) => ({
        ...item,
        batch: { referenceNumber: batch?.referenceNumber, uid: batch?.uid },
      }));
    },
  };
}
