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
import { GET_PIPELINE_BY_UID, GET_PIPELINE_GEO_JSON } from './pipeline.graphql';
import { PipelineMapComponent } from '@shared/components/pipeline-map/pipeline-map.component';
import { pipelineUpsertBtn, pipeline$ } from './pipeline.form';
import { GET_PIPELINE_SECTIONS_BY_PIPELINE } from '../sections/section.graphql';
import { sectionTableBtns, sectionUpsertBtn, pipelineSection$ } from '../sections/section.form';
import { GET_ALL_PIPELINE_STATIONS_BY_PIPELINE } from '../pipeline-stations/pipeline-station.graphql';
import {
  pipelineStation$,
  pipelineStationTableBtns,
} from '../pipeline-stations/pipeline-station.form';
@Component({
  selector: 'pipeline-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="pipeline"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline';
  override subtitle = 'Pipeline Management';

  pipeline: any;
  pipelineGeoJson: string | null = null;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [pipelineUpsertBtn(this)];

  private pipelineUid = this.route.snapshot?.paramMap?.get('pipelineUid') ?? '';

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_BY_UID,
    variables: { uid: this.pipelineUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipeline$.subscribe(() => this.setContents()));
    this.subs.add(pipelineSection$.subscribe(() => this.setContents()));
    this.subs.add(pipelineStation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.pipeline = await this.fs.fetch(this.fetchParameter);
    this.title = this.pipeline?.name ?? this.title;

    // GeoJSON for the Map tab — backend returns Response<String>; fetchService unwraps `.data`.
    this.pipelineGeoJson = (await this.fs.fetch({
      notify: false,
      query: GET_PIPELINE_GEO_JSON,
      variables: { pipelineUid: this.pipelineUid },
    })) as string | null;

    const viewPipeline = formatEntityDates(this.pipeline);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'entity',
          entity: viewPipeline,
          identity: [
            { key: 'name', label: 'Pipeline Name' },
            { key: 'status', label: 'Pipeline Status' },
            'description',
          ],
          specifications: [{ key: 'spatialLength', label: 'Pipeline Length' }],
        }),
      },
      {
        type: 'table',
        name: 'Sections',
        label: 'Sections',
        icon: 'cards',
        keyColumns: [
          'index',
          { field: 'sectionId', header: 'Name' },
          'diameter',
          'maxPressure',
          'minPressure',
          'materialUsed',
          { field: 'installationDate', type: 'date' },
          'length',
          'actions',
        ],
        actionButtons: sectionTableBtns(this),
        reloadActions$: [pipelineSection$],
        fetchParameter: {
          query: GET_PIPELINE_SECTIONS_BY_PIPELINE,
          variables: { pipelineUid: this.pipelineUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [sectionUpsertBtn(this)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'sections', data.uid),
          },
        ],
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
          query: GET_ALL_PIPELINE_STATIONS_BY_PIPELINE,
          variables: { pipelineUid: this.pipelineUid, active: true },
        },
        hasActionsColumn: true,
        theme: 'simple',
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'pipeline-stations', data.uid),
          },
        ],
      },
      {
        type: 'component',
        name: 'Map',
        label: 'Map',
        icon: 'map',
        permissions: ['ROLE_VIEW_PIPELINE'],
        componentType: PipelineMapComponent,
        componentInputs: {
          geoJson: this.pipelineGeoJson,
          title: this.pipeline?.name ?? 'Pipeline',
          subtitle: this.pipeline?.description ?? null,
        },
      },
    ];

    this.cdr.detectChanges();
  }
}
