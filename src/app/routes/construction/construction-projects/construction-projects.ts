import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';

import { ALL_CONSTRUCTION_PROJECTS_PAGEABLE } from './construction-projects.graphql';
import {
  constructionProject$,
  constructionProjectTableBtns,
  constructionProjectUpsertBtn,
} from './construction-project.form';

@Component({
  selector: 'app-construction-projects',
  imports: [CommonModule, DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class ConstructionProjects extends BaseComponent {
  override title = 'Construction Projects';
  override subtitle = 'Construction project portfolio and Work Breakdown Structure';
  override actionButtons: ActionButton[] = [constructionProjectUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'code',
    'name',
    'contractor',
    'physicalAddress',
    { field: 'progressPercent', header: 'Progress (%)' },
    'status',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: constructionProjectTableBtns(this),
    reloadActions$: [constructionProject$],
    fetchParameter: {
      query: ALL_CONSTRUCTION_PROJECTS_PAGEABLE,
    },
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'construction-projects', data.uid),
      },
    ],
  };
}
