import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ReportTemplate } from './report-template.interface';
import { FIND_REPORT_TEMPLATE } from './report-template.graphql';
import { reportTemplateUpsertBtn, reportTemplate$ } from './report-template.form';
import { GET_REPORT_ACTORS_BY_TEMPLATE } from './report-actor.graphql';
import {
  reportActorTableBtns,
  reportActorUpsertBtn,
  reportActor$,
  reportStageLabel,
} from './report-actor.form';
import { GET_REPORT_RECIPIENTS_BY_TEMPLATE } from './report-recipient.graphql';
import {
  reportRecipientTableBtns,
  reportRecipientUpsertBtn,
  reportRecipient$,
} from './report-recipient.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

@Component({
  selector: 'app-report-template',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="reportTemplate"
      />
      <contents-view [contents]="contents" />
    </div>
  `,
})
export class ReportTemplateComponent extends BaseComponent implements OnInit {
  override title = 'Report Template';
  override subtitle = 'Report Template Details';

  reportTemplate: ReportTemplate | undefined;
  reportTemplateUid: string | null = this.route.snapshot?.paramMap?.get('reportTemplateUid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [reportTemplateUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_REPORT_TEMPLATE,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.reportTemplateUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(reportTemplate$.subscribe(() => this.setContents()));
    this.subs.add(reportActor$.subscribe(() => this.setContents()));
    this.subs.add(reportRecipient$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.reportTemplate = await this.fs.fetch(this.fetchParameter);
    const templateUid = this.reportTemplateUid ?? '';

    this.contents = [
      {
        type: 'html',
        name: 'Template',
        label: 'Template',
        icon: 'notes',
        content: this.reportTemplate?.content,
      },
      {
        type: 'table',
        name: 'Actors',
        label: 'Actors',
        icon: 'list',
        permissions: ['ROLE_VIEW_REPORT_ACTORS'],
        keyColumns: [
          'index',
          { field: 'sequence', header: 'Seq' },
          { field: 'role.name', header: 'Role', valueFn: (row: any) => row?.role?.name ?? '' },
          { field: 'action', header: 'Stage', valueFn: (row: any) => reportStageLabel(row?.action) },
          'actions',
        ],
        actionButtons: reportActorTableBtns(this, templateUid),
        reloadActions$: [reportActor$],
        fetchParameter: {
          query: GET_REPORT_ACTORS_BY_TEMPLATE,
          variables: {
            templateUid,
            pageableParam: { sortBy: 'sequence', sortDirection: 'ASC' },
          },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [reportActorUpsertBtn(this, templateUid)],
      },
      {
        type: 'table',
        name: 'Recipients',
        label: 'Recipients',
        icon: 'cards',
        permissions: ['ROLE_VIEW_REPORT_RECIPIENTS'],
        keyColumns: ['index', 'name', 'email', 'title', 'phone', 'actions'],
        actionButtons: reportRecipientTableBtns(this, templateUid),
        reloadActions$: [reportRecipient$],
        fetchParameter: {
          query: GET_REPORT_RECIPIENTS_BY_TEMPLATE,
          variables: { templateUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [reportRecipientUpsertBtn(this, templateUid)],
      },
    ];
  }
}
