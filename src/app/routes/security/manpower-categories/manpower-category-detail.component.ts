import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_MANPOWER_CATEGORY_BY_UID } from './manpower-category.graphql';
import {
  manpowerCategoryUpsertBtn,
  manpowerCategoryDeleteBtn,
  manpowerCategory$,
} from './manpower-category.form';

@Component({
  selector: 'manpower-category-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="manpowerCategory"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ManpowerCategoryDetailComponent extends BaseComponent implements OnInit {
  override title = 'Manpower Category';
  override subtitle = 'Manpower Category Details';

  manpowerCategory: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    manpowerCategoryUpsertBtn(this),
    manpowerCategoryDeleteBtn(this),
  ];

  private manpowerCategoryUid = this.route.snapshot?.paramMap?.get('manpowerCategoryUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_MANPOWER_CATEGORY_BY_UID,
    successFn: (res) => (this.title = res?.data?.name ?? this.title),
    variables: { uid: this.manpowerCategoryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(manpowerCategory$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.manpowerCategory = await this.fs.fetch(this.fetchParameter);
    const viewManpowerCategory = formatEntityDates(this.manpowerCategory);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewManpowerCategory,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
