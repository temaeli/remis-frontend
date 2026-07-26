import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { WaterTechnicianReport } from './water-technician-report.interface';
import {
  GET_WATER_REPORT_ITEMS,
  GET_WATER_TECHNICIAN_REPORT_BY_UID,
} from './water-technician-report.graphql';
import {
  waterTechnicianReport$,
  waterTechnicianReportProcessBtn,
} from './water-technician-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-water-technician-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="waterTechnicianReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WaterTechnicianReportComponent extends BaseComponent implements OnInit {
  override title = 'Water Technician Report';
  override subtitle = 'Water Technician Report Management';
  goBack$ = processReport$;

  waterTechnicianReport: WaterTechnicianReport | undefined;

  waterTechnicianReportUid: string = this.route.snapshot?.paramMap?.get('waterTechnicianReportUid') as any;

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WATER_TECHNICIAN_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.waterTechnicianReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(waterTechnicianReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [waterTechnicianReportProcessBtn(this)];
  }

  async setContents() {
    this.waterTechnicianReport = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.waterTechnicianReport,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',

        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'previousDay', 'today'],
            reloadActions$: [waterTechnicianReport$],
            canExportData: true,
            fetchParameter: {
              query: GET_WATER_REPORT_ITEMS,
              variables: { reportUid: this.waterTechnicianReportUid },
            },
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
