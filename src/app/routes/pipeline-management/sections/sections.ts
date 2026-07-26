import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_PIPELINE_SECTIONS } from './section.graphql';
import { sectionUpsertBtn, sectionTableBtns, pipelineSection$ } from './section.form';

@Component({
  selector: 'sections',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Sections extends BaseComponent {
  override title = 'Pipeline Sections';
  override subtitle = 'Manage Pipeline Sections';
  override actionButtons: ActionButton[] = [sectionUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'sectionId', header: 'Name' },
    {
      field: 'pipeline.name',
      header: 'Pipeline',
    },
    'diameter',
    'maxPressure',
    'minPressure',
    'materialUsed',
    { field: 'installationDate', type: 'date' },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Pipeline Sections',
    icon: 'cards',
    keyColumns: this.keyColumns,
    actionButtons: sectionTableBtns(this),
    reloadActions$: [pipelineSection$],
    fetchParameter: { query: GET_ALL_PIPELINE_SECTIONS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'sections', data.uid),
      },
    ],
  };
}
