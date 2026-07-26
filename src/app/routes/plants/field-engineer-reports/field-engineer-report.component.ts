import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldEngineerReport } from './field-engineer-report.interface';
import { fieldEngineerReport$, fieldEngineerReportProcessBtn } from './field-engineer-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_FIELD_FORM_ITEMS, GET_FIELD_REPORT_BY_UID } from './field-engineer-report.graphql';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-field-engineer-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="fieldEngineerReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class FieldEngineerReportComponent extends BaseComponent implements OnInit {
  override title = 'Field Engineer Report';
  override subtitle = 'Field Engineer Report Management';
  goBack$ = processReport$;

  fieldReportUid: string = this.route.snapshot?.paramMap?.get('fieldEngineerReportUid') as any;
  fieldEngineerReport: FieldEngineerReport | undefined;

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_FIELD_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.fieldReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(fieldEngineerReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [fieldEngineerReportProcessBtn(this)];
  }

  async setContents() {
    this.fieldEngineerReport = { ...(await this.fs.fetch(this.fetchParameter)) };

    if (this.fieldEngineerReport) delete this.fieldEngineerReport['items']; // to avoid confusion with form items

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.fieldEngineerReport,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',

        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: [
              'sno as S/No',
              'item',
              'runHours',
              'previousRunHours',
              unitOfMeasureColumn,
            ],
            reloadActions$: [fieldEngineerReport$],
            canExportData: true,
            fetchParameter: {
              query: GET_FIELD_FORM_ITEMS,
              variables: { formUid: this.fieldReportUid },
            },
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
