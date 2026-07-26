import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_ACTION_ITEM } from './security-action-item.graphql';
import {
  securityActionItemUpsertBtn,
  securityActionItemDeleteBtn,
  securityActionItem$,
} from './security-action-item.form';

@Component({
  selector: 'security-action-item-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="actionItem"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityActionItemDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Action Item';
  override subtitle = 'Security Action Item Details';

  actionItem: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityActionItemUpsertBtn(this),
    securityActionItemDeleteBtn(this),
  ];

  private actionItemUid = this.route.snapshot?.paramMap?.get('securityActionItemUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_ACTION_ITEM,
    successFn: (res) => (this.title = res?.data?.observationReported ?? this.title),
    variables: { uid: this.actionItemUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityActionItem$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.actionItem = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.actionItem);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: view,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
