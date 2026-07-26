import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import {
  constructionSopUpsertBtn,
  constructionSopTableBtns,
  constructionSop$,
} from './construction-sop.form';
import { ALL_CONSTRUCTION_SOP_RECORDS } from './construction-sop.graphql';

@Component({
  selector: 'app-construction-sop',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class ConstructionSop extends BaseComponent {
  override title = 'Construction SOP Records';
  override subtitle = 'Standard Operating Procedure Execution Records';
  override actionButtons: ActionButton[] = [constructionSopUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index as S/n',
    'referenceNumber',
    'executionDate',
    'location',
    'teamId',
    'sop',
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: constructionSopTableBtns(this),
    reloadActions$: [constructionSop$],
    fetchParameter: {
      query: ALL_CONSTRUCTION_SOP_RECORDS,
    },
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'construction-sop', data.uid),
      },
    ],
  };
}
