import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ALL_REPORT_TEMPLATE } from './report-template.graphql';
import {
  reportTemplateUpsertBtn,
  reportTemplateTableBtns,
  reportTemplate$,
} from './report-template.form';

@Component({
  selector: 'app-report-templates',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class ReportTemplatesComponent extends BaseComponent {
  override title = 'Report Templates';
  override subtitle = 'Report Templates Management';
  override actionButtons: ActionButton[] = [reportTemplateUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'name',
    {
      field: 'code',
      valueFn: (row) => row?.code.replaceAll('-', ' ').toUpperCase() ?? '',
    },
    {
      field: 'templateType',
      valueFn: (row) => (row?.templateType.replaceAll('_', ' ') ?? '').toUpperCase(),
    },
    'subject',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: reportTemplateTableBtns(this),
    reloadActions$: [reportTemplate$],
    fetchParameter: { query: ALL_REPORT_TEMPLATE },
  };
}
