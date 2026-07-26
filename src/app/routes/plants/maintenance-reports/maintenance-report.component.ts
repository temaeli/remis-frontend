import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MaintenanceReport } from './maintenance-report.interface';
import { maintenanceReport$, maintenanceReportProcessBtn } from './maintenance-report.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_MAINTENANCE_REPORT_BY_UID } from './maintenance-report.graphql';
import { GET_MAINTENANCE_FORM_ITEMS } from './maintenance-report.graphql';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';

@Component({
  selector: 'app-maintenance-report',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="maintenanceReport"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class MaintenanceReportComponent extends BaseComponent implements OnInit {
  override title = 'Maintenance Report';
  override subtitle = 'Maintenance Report Management';
  goBack$ = processReport$;

  maintenanceReport: MaintenanceReport | undefined;
  maintenanceReportUid: string = this.route.snapshot?.paramMap?.get('maintenanceReportUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_MAINTENANCE_REPORT_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.maintenanceReportUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(maintenanceReport$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [maintenanceReportProcessBtn(this)];
  }

  async setContents() {
    this.maintenanceReport = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.maintenanceReport,
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
              unitOfMeasureColumn,
              'plannedMaintenance',
              'plannedMaintenanceDone',
              'plannedMaintenanceNotDone',
              'unPlannedMaintenanceDone',
            ],
            reloadActions$: [maintenanceReport$],
            canExportData: true,
            fetchParameter: {
              query: GET_MAINTENANCE_FORM_ITEMS,
              variables: { reportUid: this.maintenanceReportUid },
            },
          },
        ],
      },
    ]);
  }
}
