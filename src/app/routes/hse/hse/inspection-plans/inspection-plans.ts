import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_INSPECTION_PLANS } from './inspection-plan.graphql';
import {
  inspectionPlanUpsertBtn,
  inspectionPlanTableBtns,
  inspectionPlan$,
} from './inspection-plan.form';

@Component({
  selector: 'inspection-plans',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class InspectionPlans extends BaseComponent {
  override title = 'Inspection Plans';
  override subtitle = 'Plan, execute and close inspections';
  override actionButtons: ActionButton[] = [inspectionPlanUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'type.name', header: 'Inspection Type' },
    'station',
    'area',
    'category',
    { field: 'inspectionDate', type: 'date' },
    { field: 'inspectedAt', type: 'dateTime' },
    { field: 'closedAt', type: 'dateTime' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Inspection Plans',
    icon: 'verification',
    keyColumns: this.keyColumns,
    actionButtons: inspectionPlanTableBtns(this),
    reloadActions$: [inspectionPlan$],
    fetchParameter: { query: GET_ALL_INSPECTION_PLANS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'inspection-plans', data.uid),
      },
    ],
  };
}
