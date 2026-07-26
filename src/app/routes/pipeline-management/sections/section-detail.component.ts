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
import { GET_PIPELINE_SECTION_BY_UID, GET_PIPELINE_SECTION_GEO_JSON } from './section.graphql';
import { sectionUpsertBtn, pipelineSection$ } from './section.form';
import { GET_PIPELINE_SEGMENTS_BY_SECTION } from '../segments/segment.graphql';
import { segmentTableBtns, segmentUpsertBtn, pipelineSegment$ } from '../segments/segment.form';
import { GET_ALL_PIPELINE_SECTIONS_COORDINATES_PAGEABLE } from './coordinate.graphql';
import { coordinateUploadBtn, pipelineSectionCoordinate$ } from './coordinate.form';
import { PipelineMapComponent } from '@shared/components/pipeline-map/pipeline-map.component';

@Component({
  selector: 'section-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="section"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SectionDetailComponent extends BaseComponent implements OnInit {
  override title = 'Section';
  override subtitle = 'Pipeline Section Management';

  section: any;
  sectionGeoJson: string | null = null;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [sectionUpsertBtn(this)];

  private sectionUid = this.route.snapshot?.paramMap?.get('sectionUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_SECTION_BY_UID,
    variables: { uid: this.sectionUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipelineSection$.subscribe(() => this.setContents()));
    this.subs.add(pipelineSegment$.subscribe(() => this.setContents()));
    this.subs.add(pipelineSectionCoordinate$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.section = await this.fs.fetch(this.fetchParameter);
    this.title = this.section?.sectionId ?? this.title;

    this.sectionGeoJson = (await this.fs.fetch({
      notify: false,
      query: GET_PIPELINE_SECTION_GEO_JSON,
      variables: { sectionUid: this.sectionUid },
    })) as string | null;

    const viewSection = formatEntityDates(this.section);
    const enrichedSection = {
      ...(viewSection ?? {}),
      pipelineName: viewSection?.pipeline?.name,
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
          entity: enrichedSection,
          identity: [{ key: 'sectionId', label: 'Section ID' }],
          context: [{ key: 'pipelineName', label: 'Pipeline' }],
          specifications: [
            { key: 'diameter', label: 'Diameter' },
            { key: 'designPressure', label: 'Design Pressure (bar)' },
            { key: 'maxPressure', label: 'Max Pressure (bar)' },
            { key: 'minPressure', label: 'Min Pressure (bar)' },
            { key: 'materialUsed', label: 'Material Used' },
            { key: 'installationDate', label: 'Installation Date' },
            { key: 'area', label: 'Area' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Segments',
        label: 'Segments',
        icon: 'location',
        keyColumns: [
          'index',
          { field: 'segmentId', header: 'Name' },
          'pipelineSegmentType',
          {
            field: 'isReadingPoint',
            header: 'Reading Point?',
            valueFn: (row: any) => (row.isReadingPoint ? 'Yes' : 'No'),
          },
          'latitude',
          'longitude',
          'elevation',
          'actions',
        ],
        actionButtons: segmentTableBtns(this),
        reloadActions$: [pipelineSegment$],
        fetchParameter: {
          query: GET_PIPELINE_SEGMENTS_BY_SECTION,
          variables: { sectionUid: this.sectionUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [segmentUpsertBtn(this)],
      },
      {
        type: 'component',
        name: 'Map',
        label: 'Map',
        icon: 'map',
        permissions: ['ROLE_VIEW_PIPELINE_SECTION'],
        componentType: PipelineMapComponent,
        componentInputs: {
          geoJson: this.sectionGeoJson,
          title: this.section?.sectionId ?? 'Section',
          subtitle: this.section?.pipeline?.name ?? null,
        },
      },
      {
        type: 'table',
        name: 'Coordinates',
        label: 'Coordinates',
        icon: 'pin',
        permissions: ['ROLE_VIEW_PIPELINE_SECTION'],
        keyColumns: [
          'index',
          'name',
          'mileage',
          'northing',
          'easting',
          'elevation',
          'distance',
          'sourceSrid',
        ],
        reloadActions$: [pipelineSectionCoordinate$],
        fetchParameter: {
          query: GET_ALL_PIPELINE_SECTIONS_COORDINATES_PAGEABLE,
          variables: {
            sectionUid: this.sectionUid,
            pageableParam: { sortBy: 'mileage', sortDirection: 'ASC' },
          },
        },
        theme: 'simple',
        headerButtons: [coordinateUploadBtn(this, this.sectionUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
