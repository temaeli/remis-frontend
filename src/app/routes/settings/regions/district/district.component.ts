import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { districtUpsertBtn, district$, District } from './district.form';
import { wardTableBtns, wardUpsertBtn, ward$ } from '../ward/ward.form';
import { GET_DISTRICTS_BY_UID } from './district.graphql';
import { GET_WARDS_BY_DISTICT } from '../ward/ward.graphql';

@Component({
  selector: 'app-district',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="district"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class DistrictComponent extends BaseComponent implements OnInit {
  override title = 'District';
  override subtitle = 'District Management';

  district: District | undefined;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [districtUpsertBtn(this)];

  private districtUid = this.route.snapshot?.paramMap?.get('districtUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_DISTRICTS_BY_UID,
    successFn: (res) => (this.title = (res as any)?.name),
    variables: { uid: this.districtUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(district$.subscribe(() => this.setContents()));
    this.subs.add(ward$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.district = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.district,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Wards',
        label: 'Wards',
        icon: 'list',
        keyColumns: ['index', 'name', 'code', 'actions'],
        actionButtons: wardTableBtns(this),
        reloadActions$: [ward$],
        fetchParameter: {
          query: GET_WARDS_BY_DISTICT,
          variables: { districtUid: this.districtUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [wardUpsertBtn(this, this.districtUid ?? undefined)],
      },
    ];

    this.cdr.detectChanges();
  }
}
