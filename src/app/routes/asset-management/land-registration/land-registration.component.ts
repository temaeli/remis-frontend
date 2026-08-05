import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { LandRegistration } from '../asset-registry.interface';
import { FIND_LAND_REGISTRATION } from './land-registration.graphql';
import { landRegistration$, landRegistrationUpsertBtn } from './land-registration.form';

@Component({
  selector: 'app-land-registration',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="landRegistration"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class LandRegistrationComponent extends BaseComponent implements OnInit {
  override title = 'Land Registration';
  override subtitle = 'Land Registration Details';

  landRegistration: LandRegistration | undefined;
  landRegistrationUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [landRegistrationUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_LAND_REGISTRATION,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.landRegistrationUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(landRegistration$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.landRegistration = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Land Registration Details',
        label: 'Land Registration Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt'],
        entity: this.landRegistration,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
