import { Component, ChangeDetectionStrategy, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  gasNomination$,
  gasNominationUpsertBtn,
  submitNominationBtn,
  checkCutoffBtn,
} from './my-gas-nomination.form';
import { MY_GAS_NOMINATIONS } from './my-gas-nominations.graphql';
import { UpstreamerDispatches } from './upstreamer-dispatches';
import { ProcessStatus } from '@shared/crud/process-status';

@Component({
  selector: 'app-gas-nomination-external',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataGridComponent, PageHeaderComponent, UpstreamerDispatches],
  template: `
    @if (isUpstreamClient()) {
      <!-- Upstreamer: Show dispatches -->
      <app-upstreamer-dispatches />
    } @else {
      <!-- Downstream: Show nominations -->
      <div class="size-full flex-1 flex flex-col gap-3">
        <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
        <data-grid class="flex flex-col" theme="simple" [gridParameter]="gridParameter" />
      </div>
    }
  `,
})
export class External extends BaseComponent {
  override title = 'Gas Nominations';
  override subtitle = 'My Nominations';

  override actionButtons: ActionButton[] = [checkCutoffBtn(this), gasNominationUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index as (S/N)',
    'referenceNumber',
    'nominationDate',
    {
      field: 'status',
      valueFn: (row) => row?.status?.replace(/_/g, ' ') || row?.status,
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'My Gas Nominations',
    icon: 'natural_gas',
    keyColumns: this.keyColumns,
    isPageable: false,
    actionButtons: [gasNominationUpsertBtn(this), submitNominationBtn(this)],
    reloadActions$: [gasNomination$],
    fetchParameter: { query: MY_GAS_NOMINATIONS },
    showFunction: (row: any) => {
      return row?.status === ProcessStatus.DRAFT;
    },
  };

  // Convert user$ BehaviorSubject to a signal for reactive updates
  private userSignal = toSignal(this.auth.user$, { initialValue: {} });

  isUpstreamClient = computed(() => {
    const user = this.userSignal();
    const clientType = user?.clientType;
    const isUpstream = clientType !== 'DOWN';
    console.log(
      '[External] User:',
      user?.email,
      'clientType:',
      clientType,
      'isUpstream:',
      isUpstream,
    );
    return isUpstream;
  });
}
