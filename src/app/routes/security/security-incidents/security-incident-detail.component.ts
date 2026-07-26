import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_INCIDENT } from './security-incident.graphql';
import { securityIncidentUpsertBtn, securityIncident$ } from './security-incident.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';
import { attachmentsContent } from '../shared/security-attachments';
import { SECURITY_INCIDENT_ATTACHMENTS } from '../shared/security-attachments.graphql';
import { securityPdfBtn } from '../shared/security-pdf';
import { SECURITY_INCIDENT_PDF } from '../shared/security-pdf.graphql';
import { SECURITY_INVESTIGATIONS_BY_INCIDENT } from '../security-investigations/security-investigation.graphql';
import {
  securityInvestigationUpsertBtn,
  securityInvestigation$,
} from '../security-investigations/security-investigation.form';

@Component({
  selector: 'security-incident-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="incident"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityIncidentDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Incident';
  override subtitle = 'Security Incident Details';

  incident: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityIncidentUpsertBtn(this),
    securityPdfBtn(this, {
      query: SECURITY_INCIDENT_PDF,
      variablesFn: (row) => ({ incidentUid: row?.uid ?? this.incidentUid }),
      fileNameFn: (row) => `security-incident-${row?.referenceNumber ?? row?.uid ?? ''}`,
      permissions: ['ROLE_VIEW_ALL_SECURITY_INCIDENT', 'ROLE_VIEW_SECURITY_INCIDENT'],
    }),
  ];

  private incidentUid = this.route.snapshot?.paramMap?.get('securityIncidentUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_INCIDENT,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.incidentUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityIncident$.subscribe(() => this.setContents()));
    this.subs.add(securityInvestigation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.incident = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.incident);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: view,
        fetchParameter: this.fetchParameter,
      },
      attachmentsContent(this, SECURITY_INCIDENT_ATTACHMENTS, { incidentUid: this.incidentUid }, [
        'ROLE_VIEW_ALL_SECURITY_INCIDENT',
        'ROLE_VIEW_SECURITY_INCIDENT',
      ]),
      {
        type: 'table',
        name: 'Investigations',
        label: 'Related Investigations',
        icon: 'policy',
        permissions: ['ROLE_VIEW_ALL_SECURITY_INVESTIGATION', 'ROLE_VIEW_SECURITY_INVESTIGATION'],
        keyColumns: [
          'index',
          'referenceNumber',
          'investigationType',
          'investigationDate',
          'subjectPerson',
          'status',
        ],
        fetchParameter: {
          query: SECURITY_INVESTIGATIONS_BY_INCIDENT,
          variables: { incidentUid: this.incidentUid },
        },
        theme: 'simple',
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) =>
              this.router.navigate(['/security/security-investigations', data.uid]),
          },
        ],
        headerButtons: [
          {
            ...securityInvestigationUpsertBtn(this),
            label: 'New Investigation',
            click: () =>
              securityInvestigationUpsertBtn(this).click?.({
                incident: { uid: this.incidentUid },
              } as any),
          },
        ],
      },
      approvalHistoryContent(SECURITY_SUBJECT.INCIDENT, this.incidentUid),
    ];

    this.cdr.detectChanges();
  }
}
