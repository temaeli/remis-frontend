import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { Cost } from '../project-registry.interface';
import { FIND_COST } from './cost.graphql';
import { cost$, costUpsertBtn } from './cost.form';

@Component({
  selector: 'app-cost',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="cost"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class CostComponent extends BaseComponent implements OnInit {
  override title = 'Cost';
  override subtitle = 'Cost Details';

  cost: Cost | undefined;
  costUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [costUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_COST,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.costUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(cost$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.cost = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Cost Details',
        label: 'Cost Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.cost,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
