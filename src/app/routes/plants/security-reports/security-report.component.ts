import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { SecurityReport } from './security-report.interface';
import { GET_SECURITY_REPORT_BY_UID } from './security-report.graphql';
import {
  securityReportUpsertBtn,
  securityReport$,
  securityReportProcessBtn,
} from './security-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_SECURITY_REPORT_ITEMS } from './security-report.graphql';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-security-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="securityReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityReportComponent extends BaseComponent implements OnInit {
  override title = 'Security Report';
  override subtitle = 'Security Report Management';
  goBack$ = processReport$;

  securityReport: SecurityReport | undefined;
  securityReportUid: string = this.route.snapshot?.paramMap?.get('securityReportUid') as any;

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_SECURITY_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.securityReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(securityReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [securityReportProcessBtn(this)];
  }

  async setContents() {
    this.securityReport = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.securityReport,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',

        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'count'],
            reloadActions$: [securityReport$],
            canExportData: true,
            fetchParameter: {
              query: GET_SECURITY_REPORT_ITEMS,
              variables: { reportUid: this.securityReportUid },
            },
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
