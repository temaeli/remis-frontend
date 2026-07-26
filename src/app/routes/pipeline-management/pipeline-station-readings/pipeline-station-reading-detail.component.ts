import { buildNarrative } from '../pipeline-module.constants';
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
  GET_PIPELINE_STATION_READING_BY_UID,
  GET_STATION_DISCHARGE_READINGS_BY_STATION_READING,
  GET_STATION_SUCTION_READINGS_BY_STATION_READING,
} from './pipeline-station-reading.graphql';
import {
  pipelineStationReadingDeleteBtn,
  pipelineStationReadingSubmitBtn,
  pipelineStationReadingApproveBtn,
  pipelineStationReadingRejectBtn,
  pipelineStationReading$,
} from './pipeline-station-reading.form';

@Component({
  selector: 'pipeline-station-reading-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="reading"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineStationReadingDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline Station Reading';
  override subtitle = 'Pipeline Station Reading Details';

  reading: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    pipelineStationReadingSubmitBtn(this),
    pipelineStationReadingApproveBtn(this),
    pipelineStationReadingRejectBtn(this),
    pipelineStationReadingDeleteBtn(this),
  ];

  private pipelineStationReadingUid = this.route.snapshot?.paramMap?.get(
    'pipelineStationReadingUid',
  );

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_STATION_READING_BY_UID,
    variables: { uid: this.pipelineStationReadingUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(pipelineStationReading$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.reading = await this.fs.fetch(this.fetchParameter);
    const viewReading = formatEntityDates(this.reading, {
      extraDateTimeKeys: ['readingTime'],
    });
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const enrichedReading = {
      ...(viewReading ?? {}),
      stationName: viewReading?.station?.name,
      approvedByName: fullName(viewReading?.approvedBy),
      rejectedByName: fullName(viewReading?.rejectedBy),
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
          entity: enrichedReading,
          identity: [{ key: 'readingTime', label: 'Reading Time' }],
          context: [{ key: 'stationName', label: 'Pipeline Station' }],
          specifications: [
            { key: 'remarks', label: 'Remarks' },
          ],
          operational: [
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'approvedByName', label: 'Approved By' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'rejectedByName', label: 'Rejected By' },
            { key: 'rejectedAt', label: 'Rejected On' },
            { key: 'comment', label: 'Review Comment' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Suctions',
        label: 'Suction Readings',
        icon: 'workflow',
        keyColumns: [
          'index',
          { field: 'suctionPoint.name', header: 'Point' },
          { field: 'temperature', header: 'Temperature (°C)' },
          { field: 'pressure', header: 'Pressure (bar)' },
        ],
        reloadActions$: [pipelineStationReading$],
        fetchParameter: {
          query: GET_STATION_SUCTION_READINGS_BY_STATION_READING,
          variables: { stationReadingUid: this.pipelineStationReadingUid },
        },
        theme: 'simple',
      },
      {
        type: 'table',
        name: 'Discharges',
        label: 'Discharge Readings',
        icon: 'workflow',
        keyColumns: [
          'index',
          { field: 'dischargePoint.name', header: 'Point' },
          { field: 'temperature', header: 'Temperature (°C)' },
          { field: 'pressure', header: 'Pressure (bar)' },
        ],
        reloadActions$: [pipelineStationReading$],
        fetchParameter: {
          query: GET_STATION_DISCHARGE_READINGS_BY_STATION_READING,
          variables: { stationReadingUid: this.pipelineStationReadingUid },
        },
        theme: 'simple',
      },
    ];

    this.cdr.detectChanges();
  }
}
