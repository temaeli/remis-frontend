import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PowerReport } from './power-report.interface';
import { powerReport$, powerReportProcessBtn } from './power-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_POWER_GEN_REPORT_ITEMS, GET_POWER_REPORT_BY_UID } from './power-report.graphql';
import { processReport$ } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-power-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="powerReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PowerReportComponent extends BaseComponent implements OnInit {
  override title = 'Power Report';
  override subtitle = 'Power Report Management';
  goBack$ = processReport$;

  powerReport: PowerReport | undefined;
  powerReportUid: string = this.route.snapshot?.paramMap?.get('powerReportUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_POWER_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.powerReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(powerReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [powerReportProcessBtn(this)];
  }

  async setContents() {
    this.powerReport = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.powerReport,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',

        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: [
              'sno as S/No',
              'previousMwh type(number)',
              'todayMwh type(number)',
              'powerDemand type(number)',

              'previousHours type(number)',
              'todayHours type(number)',
              'last24Hours type(number)',
            ],
            reloadActions$: [powerReport$],
            canExportData: true,
            fetchParameter: {
              query: GET_POWER_GEN_REPORT_ITEMS,
              variables: { formUid: this.powerReportUid },
            },
          },
        ],
      },
    ]);
  }
}
