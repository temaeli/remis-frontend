import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { LabReport } from './lab-report.interface';
import { labReport$, labReportProcessBtn } from './lab-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_LAB_FORM_ITEMS, GET_LAB_REPORT_BY_UID } from './lab-report.graphql';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-lab-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="labReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class LabReportComponent extends BaseComponent implements OnInit {
  override title = 'Lab Report';
  override subtitle = 'Lab Report Management';
  goBack$ = processReport$;

  labReport: LabReport | undefined;
  labReportUid: string = this.route.snapshot?.paramMap?.get('labReportUid') as any;

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_LAB_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.labReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(labReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [labReportProcessBtn(this)];
  }

  async setContents() {
    this.labReport = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.labReport,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',

        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', 'measuredValue', unitOfMeasureColumn], //'uoM'
            canExportData: true,
            reloadActions$: [labReport$],
            fetchParameter: {
              query: GET_LAB_FORM_ITEMS,
              variables: { formUid: this.labReportUid },
            },
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
