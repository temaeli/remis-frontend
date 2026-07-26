import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { HseReport } from './hse-report.interface';
import { hseReport$, hseReportProcessBtn } from './hse-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_HSE_FORM_ITEMS, GET_HSE_REPORT_BY_UID } from './hse-report.graphql';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-hse-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="hseReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow contents" [contents]="contents" />
    </div>
  `,
})
export class HseReportComponent extends BaseComponent implements OnInit {
  override title = 'HSE Report';
  override subtitle = 'HSE Report Management';
  goBack$ = processReport$;

  hseReport: HseReport | undefined;
  hseReportUid: string = this.route.snapshot?.paramMap?.get('hseReportUid') as any;

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'contents',
    query: GET_HSE_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.hseReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(hseReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [hseReportProcessBtn(this)];
  }

  async setContents() {
    this.hseReport = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.hseReport,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[2fr_3fr]',

        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            reloadActions$: [hseReport$],
            canExportData: true,
            keyColumns: [
              'sno as S/No',
              'item',
              'count',
              'prevCount',
              unitOfMeasureColumn,
              'createdAt type(date)',
            ],
            fetchParameter: {
              query: GET_HSE_FORM_ITEMS,
              variables: { formUid: this.hseReportUid },
            },
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
