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
import { GET_PIPELINE_READING_BY_UID } from './reading.graphql';
import {
  pipelineReadingUpsertBtn,
  pipelineReadingDeleteBtn,
  pipelineReadingSubmitBtn,
  pipelineReading$,
} from './reading.form';

@Component({
  selector: 'reading-detail',
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
export class ReadingDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline Reading';
  override subtitle = 'Pipeline Reading Details';

  reading: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    pipelineReadingUpsertBtn(this),
    pipelineReadingSubmitBtn(this),
    pipelineReadingDeleteBtn(this),
  ];

  private pipelineReadingUid = this.route.snapshot?.paramMap?.get('pipelineReadingUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_READING_BY_UID,
    variables: { uid: this.pipelineReadingUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipelineReading$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.reading = await this.fs.fetch(this.fetchParameter);
    this.title = this.reading?.pipelineSegment?.segmentId ?? this.title;
    const viewReading = formatEntityDates(this.reading, {
      extraDateTimeKeys: ['readingTime'],
    });
    const enrichedReading = {
      ...(viewReading ?? {}),
      segmentName: viewReading?.pipelineSegment?.segmentId,
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
          context: [{ key: 'segmentName', label: 'Pipeline Segment' }],
          specifications: [
            { key: 'temperatureIn', label: 'Inlet Temperature (°C)' },
            { key: 'pressureIn', label: 'Inlet Pressure (bar)' },
            { key: 'temperatureOut', label: 'Outlet Temperature (°C)' },
            { key: 'pressureOut', label: 'Outlet Pressure (bar)' },
            { key: 'flowRate', label: 'Flow Rate' },
          ],
          operational: [{ key: 'status', label: 'Reading Status' }],
        }),
      },
    ];

    this.cdr.detectChanges();
  }
}
