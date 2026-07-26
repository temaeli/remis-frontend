import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MyReportsInbox } from '../my-reports/my-reports-inbox';
import {
  hseReport$,
  hseReportExportBtn,
  hseReportUpsertBtn,
  hseReportDeleteBtn,
} from './hse-report.form';
import { SectionEnum } from './hse-report.interface';

// HSE-scoped mount of the shared My Reports inbox.
@Component({
  selector: 'hse-my-reports',
  standalone: true,
  imports: [MyReportsInbox],
  template: `
    <my-reports-inbox
      [section]="section"
      detailSlug="hse"
      [reload$]="reload$"
      [actionButtons]="actionButtons"
      [headerActionButtons]="headerActionButtons"
      subtitle="HSE reports awaiting your action and reports you created"
    />
  `,
})
export class HseMyReports extends BaseComponent {
  section = SectionEnum.HSE;
  reload$ = hseReport$;
  headerActionButtons: ActionButton[] = [hseReportUpsertBtn(this)];
  override actionButtons: ActionButton[] = [
    hseReportExportBtn(this),
    hseReportUpsertBtn(this),
    hseReportDeleteBtn(this),
  ];
}
