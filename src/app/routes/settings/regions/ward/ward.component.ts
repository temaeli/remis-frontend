import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { wardUpsertBtn, ward$, Ward } from './ward.form';
import { subwardTableBtns, subwardUpsertBtn, subward$ } from '../subward/subward.form';
import { GET_WARD_BY_UID } from './ward.graphql';
import { GET_SUB_WARDS_BY_WARD } from '../subward/subward.graphql';

@Component({
  selector: 'app-ward',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="ward"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WardComponent extends BaseComponent implements OnInit {
  override title = 'Ward';
  override subtitle = 'Ward Management';

  ward: Ward | undefined;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [wardUpsertBtn(this)];

  private wardUid = this.route.snapshot?.paramMap?.get('wardUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WARD_BY_UID,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.wardUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(ward$.subscribe(() => this.setContents()));
    this.subs.add(subward$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.ward = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.ward,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Sub-Wards',
        label: 'Sub-Wards',
        icon: 'location',
        keyColumns: ['index', 'name', 'code', 'actions'],
        actionButtons: subwardTableBtns(this),
        reloadActions$: [subward$],
        fetchParameter: {
          query: GET_SUB_WARDS_BY_WARD,
          variables: { uid: this.wardUid, deletedStatus: false },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [subwardUpsertBtn(this, this.wardUid ?? undefined)],
      },
    ];

    this.cdr.detectChanges();
  }
}
