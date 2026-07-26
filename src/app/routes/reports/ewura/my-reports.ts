import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MyReportsInbox } from '../my-reports/my-reports-inbox';
import {
  ewuraReport$,
  ewuraReportExportBtn,
  ewuraReportUpsertBtn,
  ewuraReportDeleteBtn,
} from './ewura-report.form';
import { SectionEnum } from './ewura-report.interface';

// EWURA-scoped mount of the shared My Reports inbox.
@Component({
  selector: 'ewura-my-reports',
  standalone: true,
  imports: [MyReportsInbox],
  template: `
    <my-reports-inbox
      [section]="section"
      detailSlug="ewura"
      [reload$]="reload$"
      [actionButtons]="actionButtons"
      [headerActionButtons]="headerActionButtons"
      subtitle="EWURA reports awaiting your action and reports you created"
    />
  `,
})
export class EwuraMyReports extends BaseComponent {
  section = SectionEnum.REPORT;
  reload$ = ewuraReport$;
  // Create lives in the page header (no row context = create a new report).
  headerActionButtons: ActionButton[] = [ewuraReportUpsertBtn(this)];
  // Row actions. Edit (upsert with a row), Export and Delete are per-report.
  // Workflow-progression actions (Submit/Approve/Reject/Regenerate) live on the
  // report detail only — an actor must open the report before acting on it.
  override actionButtons: ActionButton[] = [
    ewuraReportExportBtn(this),
    ewuraReportUpsertBtn(this),
    ewuraReportDeleteBtn(this),
  ];
}
