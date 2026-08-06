import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { RegistryMasterPlan } from '../project-registry.interface';
import { FIND_REGISTRY_MASTER_PLAN } from './master-plan.graphql';
import { registryMasterPlan$, registryMasterPlanUpsertBtn } from './master-plan.form';

@Component({
  selector: 'app-master-plan',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="registryMasterPlan"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class RegistryMasterPlanComponent extends BaseComponent implements OnInit {
  override title = 'Master Plan';
  override subtitle = 'Master Plan Details';

  registryMasterPlan: RegistryMasterPlan | undefined;
  registryMasterPlanUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [registryMasterPlanUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_REGISTRY_MASTER_PLAN,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.registryMasterPlanUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(registryMasterPlan$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.registryMasterPlan = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Master Plan Details',
        label: 'Master Plan Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.registryMasterPlan,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
