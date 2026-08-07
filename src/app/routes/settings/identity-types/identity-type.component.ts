import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { IdentityType } from './identity-type.interface';
import { FIND_IDENTITY_TYPE } from './identity-type.graphql';
import { identityType$, identityTypeUpsertBtn } from './identity-type.form';

@Component({
  selector: 'app-identity-type',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="identityType"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class IdentityTypeComponent extends BaseComponent implements OnInit {
  override title = 'Identity Type';
  override subtitle = 'Identity Type Details';

  identityType: IdentityType | undefined;
  identityTypeUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [identityTypeUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_IDENTITY_TYPE,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.identityTypeUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(identityType$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.identityType = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Identity Type Details',
        label: 'Identity Type Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.identityType,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
