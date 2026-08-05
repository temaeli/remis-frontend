import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

import { LandParcel } from './land-parcel.interface';
import { FIND_LAND_PARCEL } from './land-parcel.graphql';
import { landParcelUpsertBtn, landParcel$ } from './land-parcel.form';

@Component({
  selector: 'app-land-parcel',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="landParcel"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class LandParcelComponent extends BaseComponent implements OnInit {
  override title = 'Land Parcel';
  override subtitle = 'Land Parcel Management';

  landParcel: LandParcel | undefined;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [landParcelUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_LAND_PARCEL,
    successFn: (res) => (this.title = res?.data?.titleNumber),
    variables: { uid: this.route.snapshot?.paramMap?.get('landParcelUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(landParcel$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.landParcel = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.landParcel,
        fetchParameter: this.fetchParameter,
      },
    ];
  }
}
