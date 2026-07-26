import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { processStatusFromTimestamps } from '@shared/crud';
import { GET_EMISSION_LOG_BY_UID } from './emission-log.graphql';
import {
  emissionLogUpsertBtn,
  emissionLogSubmitBtn,
  emissionLogApproveBtn,
  emissionLogRejectBtn,
  emissionLogDeleteBtn,
  emissionLog$,
} from './emission-log.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'emission-log-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="log"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class EmissionLogDetailComponent extends BaseComponent implements OnInit {
  override title = 'Emission Log';
  override subtitle = 'Daily emission record';

  log: any;
  override contents: ContentParameter[] = [];

  private logUid =
    this.route.snapshot?.paramMap?.get('logUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    emissionLogUpsertBtn(this),
    emissionLogSubmitBtn(this),
    emissionLogApproveBtn(this),
    emissionLogRejectBtn(this),
    emissionLogDeleteBtn(this, () => this.router.navigateByUrl('/hse/emission-logs')),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_EMISSION_LOG_BY_UID,
    variables: { uid: this.logUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(emissionLog$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.log = await this.fs.fetch(this.fetchParameter);
    const headerSubstance = this.log?.emissionSubstance?.name;
    if (headerSubstance) this.subtitle = `${headerSubstance} — daily log`;

    const viewLog = formatEntityDates(this.log, { extraDateTimeKeys: [] });
    const enriched = {
      ...(viewLog ?? {}),
      emissionSubstanceName: viewLog?.emissionSubstance?.name,
      workingStationName: viewLog?.workingStation?.name,
      status: processStatusFromTimestamps(viewLog ?? {}),
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
          entity: enriched,
          identity: [
            { key: 'date', label: 'Date' },
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'rejectedAt', label: 'Rejected On' },
          ],
          context: [
            { key: 'emissionSubstanceName', label: 'Emission Substance' },
            { key: 'workingStationName', label: 'Working Station' },
          ],
          specifications: [
            { key: 'amountEmitted', label: 'Amount Emitted' },
            { key: 'unitOfMeasure', label: 'Unit of Measure' },
            { key: 'remarks', label: 'Remarks' },
            { key: 'status', label: 'Status' },
            { key: 'comment', label: 'Approval / Rejection Comment' },
          ],
        }),
      },
    ];

    this.cdr.detectChanges();
  }
}
