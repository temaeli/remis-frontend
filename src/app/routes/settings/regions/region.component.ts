import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Region } from './region.interface';
import { GET_REGION_BY_ID } from './region.graphql';
import { regionUpsertBtn, region$ } from './region.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_DISTRICTS_BY_REGION } from './district/district.graphql';
import { districtTableBtns, districtUpsertBtn, district$ } from './district/district.form';

@Component({
  selector: 'app-region.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="region"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class RegionComponent extends BaseComponent implements OnInit {
  override title = 'Region';
  override subtitle = 'Region Management';

  region: Region | undefined;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [regionUpsertBtn(this)];

  private regionUid = this.route.snapshot?.paramMap?.get('regionUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_REGION_BY_ID,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.regionUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(region$.subscribe(() => this.setContents()));
    this.subs.add(district$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.region = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.region,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Districts',
        label: 'Districts',
        icon: 'domain',
        keyColumns: ['index', 'name', 'code', 'actions'],
        actionButtons: districtTableBtns(this),
        reloadActions$: [district$],
        fetchParameter: {
          query: GET_DISTRICTS_BY_REGION,
          variables: { uid: this.regionUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [districtUpsertBtn(this, this.regionUid ?? undefined)],
      },
    ];

    this.cdr.detectChanges();
  }
}
