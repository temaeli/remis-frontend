import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { CostType } from '../project-registry.interface';
import { FIND_COST_TYPE } from './cost-type.graphql';
import { costType$, costTypeUpsertBtn } from './cost-type.form';

@Component({
  selector: 'app-cost-type',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="costType"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class CostTypeComponent extends BaseComponent implements OnInit {
  override title = 'Cost Type';
  override subtitle = 'Cost Type Details';

  costType: CostType | undefined;
  costTypeUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [costTypeUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_COST_TYPE,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.costTypeUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(costType$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.costType = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Cost Type Details',
        label: 'Cost Type Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.costType,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
