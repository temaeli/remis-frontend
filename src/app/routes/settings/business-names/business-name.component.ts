import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { BusinessName } from './business-name.interface';
import { FIND_BUSINESS_NAME } from './business-name.graphql';
import { businessName$, businessNameUpsertBtn } from './business-name.form';

@Component({
  selector: 'app-business-name',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="businessName"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class BusinessNameComponent extends BaseComponent implements OnInit {
  override title = 'Business Name';
  override subtitle = 'Business Name Details';

  businessName: BusinessName | undefined;
  businessNameUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [businessNameUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_BUSINESS_NAME,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.businessNameUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(businessName$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.businessName = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Business Name Details',
        label: 'Business Name Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.businessName,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
