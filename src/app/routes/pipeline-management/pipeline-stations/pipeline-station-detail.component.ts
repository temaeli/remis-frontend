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
import { PipelineMapComponent } from '@shared/components/pipeline-map/pipeline-map.component';
import { GET_PIPELINE_STATION_BY_UID } from './pipeline-station.graphql';
import {
  pipelineStationUpsertBtn,
  pipelineStationDeleteBtn,
  pipelineStation$,
} from './pipeline-station.form';
import {
  GET_ALL_STATION_COORDINATES_BY_STATION,
  GET_STATION_GEO_JSON,
} from './station-coordinate.graphql';
import { stationCoordinatesManageBtn, stationCoordinate$ } from './station-coordinate.form';
import { GET_PIPELINE_SUCTIONS_BY_STATION } from '../pipeline-station-suctions/suction.graphql';
import {
  suctionTableBtns,
  suctionUpsertBtnForStation,
  pipelineStationSuction$,
} from '../pipeline-station-suctions/suction.form';
import { GET_PIPELINE_DISCHARGES_BY_STATION } from '../pipeline-station-discharges/discharge.graphql';
import {
  dischargeTableBtns,
  dischargeUpsertBtnForStation,
  pipelineStationDischarge$,
} from '../pipeline-station-discharges/discharge.form';

@Component({
  selector: 'pipeline-station-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="pipelineStation"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineStationDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline Station';
  override subtitle = 'Pipeline Station Details';

  pipelineStation: any;
  stationGeoJson: string | null = null;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    pipelineStationUpsertBtn(this),
    pipelineStationDeleteBtn(this),
  ];

  private pipelineStationUid = this.route.snapshot?.paramMap?.get('pipelineStationUid') ?? '';

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_STATION_BY_UID,
    variables: { uid: this.pipelineStationUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipelineStation$.subscribe(() => this.setContents()));
    this.subs.add(pipelineStationSuction$.subscribe(() => this.setContents()));
    this.subs.add(pipelineStationDischarge$.subscribe(() => this.setContents()));
    this.subs.add(stationCoordinate$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.pipelineStation = await this.fs.fetch(this.fetchParameter);
    this.stationGeoJson = (await this.fs.fetch({
      notify: false,
      query: GET_STATION_GEO_JSON,
      variables: { StationUid: this.pipelineStationUid },
    })) as string | null;
    this.title = this.pipelineStation?.name ?? this.title;
    const viewPipelineStation = formatEntityDates(this.pipelineStation);
    const segment = viewPipelineStation?.pipelineSegment;
    const section = segment?.pipelineSection;
    const enrichedStation = {
      ...(viewPipelineStation ?? {}),
      pipelineName: section?.pipeline?.name,
      sectionName: section?.sectionId,
      segmentName: segment?.segmentId,
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
          entity: enrichedStation,
          identity: [
            { key: 'name', label: 'Station Name' },
            { key: 'stationType', label: 'Station Type' },
            'description',
          ],
          context: [
            { key: 'pipelineName', label: 'Pipeline' },
            { key: 'sectionName', label: 'Pipeline Section' },
            { key: 'segmentName', label: 'Pipeline Segment' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Suctions',
        label: 'Suctions',
        icon: 'workflow',
        keyColumns: ['index', 'name', 'description', 'actions'],
        actionButtons: suctionTableBtns(this),
        reloadActions$: [pipelineStationSuction$],
        fetchParameter: {
          query: GET_PIPELINE_SUCTIONS_BY_STATION,
          variables: { stationUid: this.pipelineStationUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [suctionUpsertBtnForStation(this, this.pipelineStationUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) =>
              navigateRelativeTo(this, 'pipeline-station-suctions', data.uid),
          },
        ],
      },
      {
        type: 'table',
        name: 'Discharges',
        label: 'Discharges',
        icon: 'workflow',
        keyColumns: ['index', 'name', 'description', 'actions'],
        actionButtons: dischargeTableBtns(this),
        reloadActions$: [pipelineStationDischarge$],
        fetchParameter: {
          query: GET_PIPELINE_DISCHARGES_BY_STATION,
          variables: { stationUid: this.pipelineStationUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [dischargeUpsertBtnForStation(this, this.pipelineStationUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) =>
              navigateRelativeTo(this, 'pipeline-station-discharges', data.uid),
          },
        ],
      },
      {
        type: 'table',
        name: 'Coordinates',
        label: 'Coordinates',
        icon: 'route',
        permissions: ['ROLE_VIEW_PIPELINE_STATION'],
        keyColumns: [
          'index',
          'name',
          'northing',
          'easting',
          { field: 'sourceSrid', header: 'SRID' },
        ],
        reloadActions$: [stationCoordinate$],
        fetchParameter: {
          query: GET_ALL_STATION_COORDINATES_BY_STATION,
          variables: { StationUid: this.pipelineStationUid, pageableParam: { size: 500 } },
        },
        theme: 'simple',
        headerButtons: [stationCoordinatesManageBtn(this, this.pipelineStationUid)],
      },
      {
        type: 'component',
        name: 'Map',
        label: 'Map',
        icon: 'map',
        permissions: ['ROLE_VIEW_PIPELINE_STATION'],
        componentType: PipelineMapComponent,
        componentInputs: {
          geoJson: this.stationGeoJson,
          title: this.pipelineStation?.name ?? 'Pipeline Station',
          subtitle: segment?.segmentId ?? null,
          emptyBody:
            'Add coordinates in the Coordinates tab to see this pipeline station rendered here.',
        },
      },
    ];

    this.cdr.detectChanges();
  }
}
