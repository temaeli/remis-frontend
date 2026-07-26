import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_CNG_STATION } from '../cng/cng-station.graphql';
import {
  cngStationUpsertBtn,
  cngStation$,
} from '../cng/cng-station.form';

@Component({
  selector: 'cng-station-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="cngStation"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class CngStationDetailComponent extends BaseComponent implements OnInit {
  override title = 'CNG Station';
  override subtitle = 'Station Details';

  cngStation: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    cngStationUpsertBtn(this),
    // cngStationDeleteBtn(this),
  ];

  private cngStationUid = this.route.snapshot?.paramMap?.get('cngStationUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_CNG_STATION,
    successFn: (res) => (this.title = res?.data?.name ?? this.title),
    variables: { uid: this.cngStationUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(cngStation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.cngStation = await this.fs.fetch(this.fetchParameter);
    const viewCngStation = formatEntityDates(this.cngStation);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewCngStation,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
