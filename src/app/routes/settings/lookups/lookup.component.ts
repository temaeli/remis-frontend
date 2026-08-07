import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { LOOKUPS } from './lookups';
import { lookupUpsertBtn } from './lookup.form';
import { Lookup, LookupModule } from './lookup.interface';

/**
 * The detail page for any one of the settings lookup tables, resolved from
 * `data.lookup` the same way the list is.
 */
@Component({
  selector: 'app-lookup',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="record"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class LookupComponent extends BaseComponent implements OnInit {
  lookup: LookupModule = LOOKUPS[this.route.snapshot.data['lookup']];

  override title = this.lookup.label;
  override subtitle = `${this.lookup.label} Details`;

  record: Lookup | undefined;
  recordUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [lookupUpsertBtn(this, this.lookup)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: this.lookup.gql.find,
    successFn: (res) => (this.title = res?.data?.[this.lookup.nameKey ?? 'name']),
    variables: { uid: this.recordUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(this.lookup.changed$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.record = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: `${this.lookup.label} Details`,
        label: `${this.lookup.label} Details`,
        icon: 'notes',
        showUndefined: true,
        entity: this.record,
        fetchParameter: this.fetchParameter,
      },
      ...(this.lookup.extraContents?.(this, this.record) ?? []),
    ];

    this.cdr.detectChanges();
  }
}
