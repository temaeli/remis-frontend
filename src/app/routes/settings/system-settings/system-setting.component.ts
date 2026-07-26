import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { SystemSetting } from './system-settings.interface';
import { FIND_SYSTEM_SETTING } from './system-settings.graphql';
import { systemSettingUpsertBtn, systemSetting$ } from './system-settings.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

@Component({
  selector: 'app-system-setting',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="systemSetting"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SystemSettingComponent extends BaseComponent implements OnInit {
  override title = 'System Setting';
  override subtitle = 'System Setting Details';

  systemSetting: SystemSetting | undefined;
  systemSettingUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [systemSettingUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SYSTEM_SETTING,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.systemSettingUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(systemSetting$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.systemSetting = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt', 'createdAt'],
        entity: this.systemSetting,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
