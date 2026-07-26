import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  gasSalesAgreementUpsertBtn,
  gasSalesAgreementTableBtns,
  gasSalesAgreement$,
} from './gas-sales-agreement.form';
import {
  ALL_GAS_SALES_AGREEMENTS_PAGEABLE,
  ALL_GAS_SALES_AGREEMENTS_BY_STATUS_PAGEABLE,
} from './gas-sales-agreement.graphql';
import { GsaStatus } from './gas-sales-agreement.interface';

@Component({
  selector: 'app-gas-sales-agreement',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent, MatTabsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />

      <mat-tab-group class="grow flex flex-col" dynamicHeight>
        <mat-tab label="All">
          <data-grid class="mt-3 flex flex-col" theme="simple" [gridParameter]="allGridParameter" />
        </mat-tab>
        <mat-tab label="Head of Operation">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="submittedToManagerGridParameter"
          />
        </mat-tab>
        <mat-tab label="Distribution Manager">
          <data-grid
            class="mt-3 flex flex-col"
            theme="simple"
            [gridParameter]="approvedByManagerGridParameter"
          />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class GasSalesAgreement extends BaseComponent {
  override title = 'Gas Sales Agreements';
  override subtitle = 'Gas Sales Agreements Management';
  override actionButtons: ActionButton[] = [gasSalesAgreementUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index as S/N',
    'clientName as Customer',
    'contractName',
    'startDate',
    'endDate',
    'minimumDailyMmscfd as Min  (MMscfd)',
    'maximumDailyMmscfd as Max  (MMscfd)',
    // 'totalVolumeMmscf as  Volume  (MMscf)',
    {
      field: 'status',
      valueFn: (row) => {
        if (row?.status === GsaStatus.SUBMITTED_TO_MANAGER) {
          return 'Head of Operation';
        } else if (row?.status === GsaStatus.APPROVED_BY_MANAGER) {
          return 'Distribution Manager';
        } else {
          return row?.status;
        }
      },
    },
    'actions',
  ];

  allGridParameter: GridParameter = {
    title: 'All Agreements',
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: gasSalesAgreementTableBtns(this),
    reloadActions$: [gasSalesAgreement$],
    fetchParameter: {
      query: ALL_GAS_SALES_AGREEMENTS_PAGEABLE,
      variables: { pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' } },
    },
  };

  submittedToManagerGridParameter: GridParameter = {
    title: 'Submitted to   Head of Operation',
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: gasSalesAgreementTableBtns(this),
    reloadActions$: [gasSalesAgreement$],
    fetchParameter: {
      query: ALL_GAS_SALES_AGREEMENTS_BY_STATUS_PAGEABLE,
      variables: {
        status: GsaStatus.SUBMITTED_TO_MANAGER,
        pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
      },
    },
  };

  approvedByManagerGridParameter: GridParameter = {
    title: 'Approved by Distribution Manager',
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: gasSalesAgreementTableBtns(this),
    reloadActions$: [gasSalesAgreement$],
    fetchParameter: {
      query: ALL_GAS_SALES_AGREEMENTS_BY_STATUS_PAGEABLE,
      variables: {
        status: GsaStatus.APPROVED_BY_MANAGER,
        pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
      },
    },
  };
}
