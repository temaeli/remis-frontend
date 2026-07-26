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
import { GET_PIPELINE_STATION_DISCHARGE_BY_UID } from './discharge.graphql';
import {
  dischargeUpsertBtn,
  dischargeDeleteBtn,
  pipelineStationDischarge$,
} from './discharge.form';

@Component({
  selector: 'pipeline-station-discharge-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="discharge"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PipelineStationDischargeDetailComponent extends BaseComponent implements OnInit {
  override title = 'Pipeline Station Discharge';
  override subtitle = 'Pipeline Station Discharge Details';

  discharge: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [dischargeUpsertBtn(this), dischargeDeleteBtn(this)];

  private dischargeUid = this.route.snapshot?.paramMap?.get('pipelineStationDischargeUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PIPELINE_STATION_DISCHARGE_BY_UID,
    variables: { uid: this.dischargeUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(pipelineStationDischarge$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.discharge = await this.fs.fetch(this.fetchParameter);
    this.title = this.discharge?.name ?? this.title;
    const viewDischarge = formatEntityDates(this.discharge);
    const enrichedDischarge = {
      ...(viewDischarge ?? {}),
      stationName: viewDischarge?.station?.name,
      stationTypeName: viewDischarge?.station?.stationType,
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
          entity: enrichedDischarge,
          identity: [{ key: 'name', label: 'Discharge Name' }, 'description'],
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
