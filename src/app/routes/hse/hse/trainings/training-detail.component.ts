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
  GET_HSE_TRAINING_BY_UID,
  GET_HSE_TRAINING_ATTENDEES_BY_TRAINING,
} from './training.graphql';
import {
  hseTrainingUpsertBtn,
  hseTrainingMarkCompletedBtn,
  hseTrainingStartBtn,
  hseTrainingCancelBtn,
  hseTrainingDeleteBtn,
  hseTraining$,
} from './training.form';
import {
  hseTrainingAttendeeTableBtns,
  hseTrainingAttendeeUpsertBtn,
  hseTrainingAttendee$,
} from './attendee.form';
import { TrainingStatus } from './training.interface';
import { HseTrainingAttendanceComponent } from './training-attendance.component';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'hse-training-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="training"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class HseTrainingDetailComponent extends BaseComponent implements OnInit {
  override title = 'HSE Training';
  override subtitle = 'Training Details';

  training: any;
  override contents: ContentParameter[] = [];

  private trainingUid =
    this.route.snapshot?.paramMap?.get('trainingUid') ?? this.route.snapshot?.paramMap?.get('uid');

  // Built per-status in setContents() — backend gates each transition by status.
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_HSE_TRAINING_BY_UID,
    variables: { uid: this.trainingUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(hseTraining$.subscribe(() => this.setContents()));
    this.subs.add(hseTrainingAttendee$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    const fetched = await this.fs.fetch(this.fetchParameter);
    const status = fetched?.status as TrainingStatus | undefined;
    const isPlanned = status === TrainingStatus.PLANNED;
    const isOngoing = status === TrainingStatus.ONGOING;
    const showAttendance = isOngoing || status === TrainingStatus.COMPLETED;

    // Apollo returns frozen objects — clone so we can stamp roster counts that
    // gate the Start (needs >=1 attendee) and Mark Completed (needs >=1 attended)
    // buttons, read via their disabledFunctions.
    const { total, attended } = await this.getRosterCounts();
    this.training = { ...fetched, attendeeCount: total, attendedCount: attended };
    this.title = this.training?.course ?? this.title;

    this.actionButtons = this.buildActionButtons(status);

    const viewTraining = formatEntityDates(this.training, {
      extraDateTimeKeys: ['completedAt'],
    });

    // Roster CRUD is only valid while PLANNED (backend deletePlanned + schedule role).
    const rosterButtons = isPlanned
      ? hseTrainingAttendeeTableBtns(this, this.trainingUid ?? '')
      : [];
    const rosterHeaderButtons = isPlanned
      ? [hseTrainingAttendeeUpsertBtn(this, this.trainingUid ?? '')]
      : [];

    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const enrichedTraining = {
      ...(viewTraining ?? {}),
      completedByName: fullName(viewTraining?.completedBy),
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
          entity: enrichedTraining,
          identity: [
            { key: 'plannedDate', label: 'Planned Date' },
            { key: 'completedAt', label: 'Completed On' },
          ],
          context: [
            { key: 'trainingInstitution', label: 'Institution' },
            { key: 'deliveryMode', label: 'Delivery Mode' },
            { key: 'category', label: 'Category' },
            { key: 'type', label: 'Type' },
          ],
          operational: [{ key: 'completedByName', label: 'Completed By' }],
          specifications: [
            { key: 'course', label: 'Course' },
            { key: 'trainingContent', label: 'Training Content' },
            { key: 'status', label: 'Status' },
            { key: 'attendeeCount', label: 'Attendees Planned' },
            { key: 'attendedCount', label: 'Attendees Attended' },
            { key: 'remarks', label: 'Remarks' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Attendees',
        label: 'Attendees',
        icon: 'people',
        permissions: ['ROLE_VIEW_HSE_TRAINING'],
        keyColumns: [
          'index',
          'name',
          'contact',
          'designation',
          'section',
          'organization',
          ...(isPlanned ? ['actions'] : []),
        ],
        actionButtons: rosterButtons,
        reloadActions$: [hseTrainingAttendee$],
        fetchParameter: {
          query: GET_HSE_TRAINING_ATTENDEES_BY_TRAINING,
          variables: { trainingUid: this.trainingUid },
        },
        hasActionsColumn: isPlanned,
        theme: 'simple',
        headerButtons: rosterHeaderButtons,
      },
      ...(showAttendance
        ? [
            {
              type: 'component' as const,
              name: 'Attendance',
              label: 'Attendance',
              icon: 'checklist',
              permissions: ['ROLE_VIEW_HSE_TRAINING'],
              componentType: HseTrainingAttendanceComponent,
              componentInputs: {
                trainingUid: this.trainingUid ?? '',
                canEdit: isOngoing,
              },
            },
          ]
        : []),
    ];

    this.cdr.detectChanges();
  }

  private buildActionButtons(status: TrainingStatus | undefined): ActionButton[] {
    if (status === TrainingStatus.PLANNED) {
      return [
        hseTrainingUpsertBtn(this),
        hseTrainingStartBtn(this),
        hseTrainingCancelBtn(this),
        hseTrainingDeleteBtn(this),
      ];
    }
    if (status === TrainingStatus.ONGOING) {
      return [hseTrainingMarkCompletedBtn(this)];
    }
    return [];
  }

  private async getRosterCounts(): Promise<{ total: number; attended: number }> {
    const page = await this.fs.fetch({
      query: GET_HSE_TRAINING_ATTENDEES_BY_TRAINING,
      variables: { trainingUid: this.trainingUid, active: true, pageableParam: { size: 500 } },
    });
    const attendees: any[] = page?.content ?? [];
    return {
      total: attendees.length,
      attended: attendees.filter((a) => !!a?.attended).length,
    };
  }
}
