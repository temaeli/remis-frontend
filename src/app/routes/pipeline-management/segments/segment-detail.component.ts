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
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_PIPELINE_SEGMENT_BY_UID } from './segment.graphql';
import {
  segmentUpsertBtn,
  segmentDeleteBtn,
  segmentSetSuctionDischargeBtn,
  pipelineSegment$,
} from './segment.form';
import { GET_PIPELINE_STATIONS_BY_PIPELINE_SEGMENT } from '../pipeline-stations/pipeline-station.graphql';
import {
  pipelineStation$,
  pipelineStationTableBtns,
  pipelineStationUpsertBtnForSegment,
} from '../pipeline-stations/pipeline-station.form';

@Component({
  selector: 'segment-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="segment"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SegmentDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline Segment';
  override subtitle = 'Pipeline Segment Details';

  segment: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  private pipelineSegmentUid = this.route.snapshot?.paramMap?.get('pipelineSegmentUid') ?? '';

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_SEGMENT_BY_UID,
    variables: { uid: this.pipelineSegmentUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipelineSegment$.subscribe(() => this.setContents()));
    this.subs.add(pipelineStation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.segment = await this.fs.fetch(this.fetchParameter);
    this.title = this.segment?.segmentId ?? this.title;
    const viewSegment = formatEntityDates(this.segment);

    this.actionButtons = [
      segmentSetSuctionDischargeBtn(this, this.segment),
      segmentUpsertBtn(this),
      segmentDeleteBtn(this),
    ];

    const suction = viewSegment?.suction;
    const discharge = viewSegment?.discharge;
    const enrichedSegment = {
      ...(viewSegment ?? {}),
      sectionName: viewSegment?.pipelineSection?.sectionId,
      suctionLabel: suction
        ? [suction.name, suction.station?.name].filter(Boolean).join(' @ ')
        : undefined,
      dischargeLabel: discharge
        ? [discharge.name, discharge.station?.name].filter(Boolean).join(' @ ')
        : undefined,
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'entity',
          entity: enrichedSegment,
          identity: [{ key: 'segmentId', label: 'Segment ID' }],
          context: [
            { key: 'sectionName', label: 'Pipeline Section' },
            { key: 'suctionLabel', label: 'Suction Point' },
            { key: 'dischargeLabel', label: 'Discharge Point' },
          ],
          specifications: [
            { key: 'wallThickness', label: 'Wall Thickness' },
            { key: 'elevation', label: 'Elevation' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Stations',
        label: 'Stations',
        icon: 'factory',
        keyColumns: [
          'index',
          'name',
          'description',
          { field: 'stationType', header: 'Station Type' },
          'actions',
        ],
        actionButtons: pipelineStationTableBtns(this),
        reloadActions$: [pipelineStation$],
        fetchParameter: {
          query: GET_PIPELINE_STATIONS_BY_PIPELINE_SEGMENT,
          variables: { segmentUid: this.pipelineSegmentUid, active: true },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [pipelineStationUpsertBtnForSegment(this, this.pipelineSegmentUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'pipeline-stations', data.uid),
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
