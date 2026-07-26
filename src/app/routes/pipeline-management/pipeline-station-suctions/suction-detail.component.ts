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
import { GET_PIPELINE_STATION_SUCTION_BY_UID } from './suction.graphql';
import { suctionUpsertBtn, suctionDeleteBtn, pipelineStationSuction$ } from './suction.form';

@Component({
  selector: 'pipeline-station-suction-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="suction"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineStationSuctionDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline Station Suction';
  override subtitle = 'Pipeline Station Suction Details';

  suction: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [suctionUpsertBtn(this), suctionDeleteBtn(this)];

  private suctionUid = this.route.snapshot?.paramMap?.get('pipelineStationSuctionUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_STATION_SUCTION_BY_UID,
    variables: { uid: this.suctionUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipelineStationSuction$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.suction = await this.fs.fetch(this.fetchParameter);
    this.title = this.suction?.name ?? this.title;
    const viewSuction = formatEntityDates(this.suction);
    const enrichedSuction = {
      ...(viewSuction ?? {}),
      stationName: viewSuction?.station?.name,
      stationTypeName: viewSuction?.station?.stationType,
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
          entity: enrichedSuction,
          identity: [{ key: 'name', label: 'Suction Name' }, 'description'],
          context: [
            { key: 'stationName', label: 'Pipeline Station' },
            { key: 'stationTypeName', label: 'Station Type' },
          ],
        }),
      },
    ];

    this.cdr.detectChanges();
  }
}
