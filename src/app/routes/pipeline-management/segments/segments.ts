import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_ALL_PIPELINE_SEGMENTS } from './segment.graphql';
import { segmentUpsertBtn, segmentTableBtns, pipelineSegment$ } from './segment.form';

@Component({
  selector: 'segments',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Segments extends BaseComponent {
  override title = 'Pipeline Segments';
  override subtitle = 'Manage Pipeline Segments';
  override actionButtons: ActionButton[] = [segmentUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'segmentId', header: 'Name' },
    {
      field: 'pipelineSection',
      header: 'Section',
      valueFn: (row: any) => row?.pipelineSection?.sectionId ?? '-',
    },
    'wallThickness',
    'elevation',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Pipeline Segments',
    icon: 'location',
    keyColumns: this.keyColumns,
    actionButtons: segmentTableBtns(this),
    reloadActions$: [pipelineSegment$],
    fetchParameter: { query: GET_ALL_PIPELINE_SEGMENTS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'segments', data.uid),
      },
    ],
  };
}
