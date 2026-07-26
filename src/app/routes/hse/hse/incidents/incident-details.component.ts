import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  GET_INCIDENT_BY_UID,
  GET_INCIDENT_AFFECTED_PEOPLE_BY_INCIDENT_UID,
  GET_INCIDENT_AFFECTED_ASSETS_BY_INCIDENT,
  GET_INCIDENT_ATTACHMENTS,
} from './incident.graphql';
import { GET_INCIDENT_INVESTIGATION_TEAM_MEMBERS_BY_INCIDENT } from './investigation-team.graphql';
import {
  investigationTeamTableBtns,
  investigationTeamUpsertBtn,
  investigationTeam$,
} from './investigation-team.form';
import { GET_INCIDENT_CORRECTIVE_ACTIONS_BY_INCIDENT } from './corrective-action.graphql';
import {
  correctiveActionTableBtns,
  correctiveActionUpsertBtn,
  correctiveAction$,
} from './corrective-action.form';
import {
  incidentUpsertBtn,
  incidentSubmitBtn,
  incidentApproveBtn,
  incidentRejectBtn,
  incidentReviewedBtn,
  incidentDeleteBtn,
  incident$,
} from './incident.form';
import {
  affectedPersonnelTableBtns,
  affectedPersonnelUpsertBtn,
  affectedPersonnel$,
} from './affected-personnel.form';
import {
  affectedAssetTableBtns,
  affectedAssetUpsertBtn,
  affectedAsset$,
} from './affected-asset.form';
import {
  incidentAttachmentTableBtns,
  incidentAttachmentUpsertBtn,
  incidentAttachment$,
} from './incident-attachment.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

const fullName = (u: any): string | undefined => {
  if (!u) return undefined;
  return (
    [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ').trim() ||
    u.username ||
    undefined
  );
};

@Component({
  selector: 'incident-details',
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
export class IncidentDetailsComponent extends BaseComponent implements OnInit {
  override title = 'Incident';
  override subtitle = 'Incident Report';

  incident: any;
  override contents: ContentParameter[] = [];

  private incidentUid =
    this.route.snapshot?.paramMap?.get('incidentUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    incidentUpsertBtn(this),
    incidentSubmitBtn(this),
    incidentApproveBtn(this),
    incidentRejectBtn(this),
    incidentReviewedBtn(this),
    incidentDeleteBtn(this),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_INCIDENT_BY_UID,
    variables: { uid: this.incidentUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(incident$.subscribe(() => this.setContents()));
    this.subs.add(affectedPersonnel$.subscribe(() => this.setContents()));
    this.subs.add(affectedAsset$.subscribe(() => this.setContents()));
    this.subs.add(investigationTeam$.subscribe(() => this.setContents()));
    this.subs.add(correctiveAction$.subscribe(() => this.setContents()));
    this.subs.add(incidentAttachment$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.incident = await this.fs.fetch(this.fetchParameter);
    this.title = this.incident?.immediateCause ?? this.title;

    const viewIncident = formatEntityDates(this.incident, {
      extraDateTimeKeys: ['timeHappened'],
    });

    const enrichedIncident = {
      ...(viewIncident ?? {}),
      workStationName: viewIncident?.workStation?.name,
      incidentTypeName: viewIncident?.incidentType?.name,
      hseoName: fullName(viewIncident?.hseo),
      rejectedByName: fullName(viewIncident?.rejectedBy),
      currentActor: viewIncident?.currentActor?.actor,
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'event',
          entity: enrichedIncident,
          identity: [
            { key: 'timeHappened', label: 'Time Happened' },
            { key: 'reviewedAt', label: 'Reviewed On' },
            { key: 'rejectedAt', label: 'Rejected On' },
          ],
          context: [
            { key: 'workStationName', label: 'Work Station' },
            { key: 'location', label: 'Location' },
          ],
          operational: [
            { key: 'reportedBy', label: 'Reported By' },
            { key: 'hseoName', label: 'HSE Officer' },
            { key: 'currentActor', label: 'Current Actor' },
            { key: 'status', label: 'Status' },
            { key: 'rejectedByName', label: 'Rejected By' },
          ],
          specifications: [
            { key: 'incidentTypeName', label: 'Incident Type' },
            { key: 'immediateCause', label: 'Immediate Cause' },
            { key: 'detailedDescription', label: 'Detailed Description' },
            { key: 'immediateActionTaken', label: 'Immediate Action Taken' },
            { key: 'rootCause', label: 'Root Cause' },
            {
              key: 'proposedActionToPreventReoccurrence',
              label: 'Proposed Action To Prevent Reoccurrence',
            },
            { key: 'comment', label: 'Review Comment' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'AffectedPersonnel',
        label: 'Affected Personnel',
        icon: 'people',
        permissions: ['ROLE_VIEW_INCIDENT'],
        keyColumns: [
          'index',
          { field: 'name', header: 'Name' },
          'affectationType',
          'description',
          'actions',
        ],
        actionButtons: affectedPersonnelTableBtns(this, this.incidentUid ?? '', () => this.incident),
        reloadActions$: [affectedPersonnel$],
        fetchParameter: {
          query: GET_INCIDENT_AFFECTED_PEOPLE_BY_INCIDENT_UID,
          variables: { incidentUid: this.incidentUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [affectedPersonnelUpsertBtn(this, this.incidentUid ?? '', () => this.incident)],
      },
      {
        type: 'table',
        name: 'AffectedAssets',
        label: 'Affected Assets',
        icon: 'category',
        permissions: ['ROLE_VIEW_INCIDENT'],
        keyColumns: [
          'index',
          { field: 'name', header: 'Name' },
          'specification',
          'affectationType',
          'description',
          'actions',
        ],
        actionButtons: affectedAssetTableBtns(this, this.incidentUid ?? '', () => this.incident),
        reloadActions$: [affectedAsset$],
        fetchParameter: {
          query: GET_INCIDENT_AFFECTED_ASSETS_BY_INCIDENT,
          variables: { incidentUid: this.incidentUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [affectedAssetUpsertBtn(this, this.incidentUid ?? '', () => this.incident)],
      },
      {
        type: 'table',
        name: 'InvestigationTeam',
        label: 'Investigation Team',
        icon: 'group',
        permissions: [
          'ROLE_VIEW_INCIDENT_INVESTIGATION_TEAM',
          'ROLE_MANAGE_INCIDENT_INVESTIGATION_TEAM',
        ],
        keyColumns: ['index', 'name', 'role', 'actions'],
        actionButtons: investigationTeamTableBtns(this, this.incidentUid ?? ''),
        reloadActions$: [investigationTeam$],
        fetchParameter: {
          query: GET_INCIDENT_INVESTIGATION_TEAM_MEMBERS_BY_INCIDENT,
          variables: { incidentUid: this.incidentUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [investigationTeamUpsertBtn(this, this.incidentUid ?? '')],
      },
      {
        type: 'table',
        name: 'CorrectiveActions',
        label: 'Corrective Actions',
        icon: 'list',
        permissions: [
          'ROLE_VIEW_INCIDENT_CORRECTIVE_ACTION',
          'ROLE_MANAGE_INCIDENT_CORRECTIVE_ACTION',
        ],
        keyColumns: [
          'index',
          'action',
          'assignedTo',
          'assignedToAs',
          { field: 'durationInDays', header: 'Duration (days)' },
          { field: 'completedAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: correctiveActionTableBtns(this, this.incidentUid ?? ''),
        reloadActions$: [correctiveAction$],
        fetchParameter: {
          query: GET_INCIDENT_CORRECTIVE_ACTIONS_BY_INCIDENT,
          variables: { incidentUid: this.incidentUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [correctiveActionUpsertBtn(this, this.incidentUid ?? '')],
      },
      {
        type: 'table',
        name: 'Attachments',
        label: 'Attachments',
        icon: 'attachment_paper',
        permissions: ['ROLE_VIEW_INCIDENT'],
        keyColumns: [
          'index',
          'attachmentTitle',
          'mediaType',
          'mediaSize',
          { field: 'createdAt', type: 'dateTime' },
          'actions',
        ],
        actionButtons: incidentAttachmentTableBtns(this, this.incidentUid ?? '', () => this.incident),
        reloadActions$: [incidentAttachment$],
        fetchParameter: {
          query: GET_INCIDENT_ATTACHMENTS,
          variables: { incidentUid: this.incidentUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [incidentAttachmentUpsertBtn(this, this.incidentUid ?? '', () => this.incident)],
      },
    ];

    this.cdr.detectChanges();
  }
}
