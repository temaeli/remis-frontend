import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_HSE_TRAININGS, GET_MY_HSE_TRAININGS } from './training.graphql';
import { hseTrainingUpsertBtn, hseTrainingTableBtns, hseTraining$ } from './training.form';

@Component({
  selector: 'hse-trainings',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class HseTrainings extends BaseComponent {
  override title = 'HSE Trainings';
  override subtitle = 'Plan and track HSE trainings';
  override actionButtons: ActionButton[] = [hseTrainingUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'course',
    'category',
    'type',
    'deliveryMode',
    { field: 'plannedDate', type: 'date' },
    'status',
    'actions',
  ];

  private canViewAll = HasPermissionDirective.hasPermission(['ROLE_VIEW_HSE_TRAINING']);

  private allOption = {
    title: 'All Trainings',
    label: 'All',
    fetchParameter: { query: GET_ALL_HSE_TRAININGS },
  };
  private mineOption = {
    title: 'My Trainings',
    label: 'My Workstations',
    fetchParameter: { query: GET_MY_HSE_TRAININGS },
  };

  gridParameter: GridParameter = {
    title: 'HSE Trainings',
    icon: 'certificate',
    keyColumns: this.keyColumns,
    actionButtons: hseTrainingTableBtns(this),
    reloadActions$: [hseTraining$],
    fetchParameter: this.canViewAll
      ? this.allOption.fetchParameter
      : this.mineOption.fetchParameter,
    // getMyHseTrainings currently returns meetings (BE copy-paste bug,
    // see BACKEND_FIXES_NEEDED.md); wired anyway so the toggle lands
    // the moment BE ships the fix.
    gridOptions: this.canViewAll
      ? [this.allOption, this.mineOption]
      : [this.mineOption, this.allOption],
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'trainings', data.uid),
      },
    ],
  };
}
