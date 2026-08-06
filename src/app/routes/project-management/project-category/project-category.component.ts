import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { ProjectCategory } from '../project-registry.interface';
import { FIND_PROJECT_CATEGORY } from './project-category.graphql';
import { projectCategory$, projectCategoryUpsertBtn } from './project-category.form';

@Component({
  selector: 'app-project-category',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="projectCategory"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ProjectCategoryComponent extends BaseComponent implements OnInit {
  override title = 'Project Category';
  override subtitle = 'Project Category Details';

  projectCategory: ProjectCategory | undefined;
  projectCategoryUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [projectCategoryUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PROJECT_CATEGORY,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.projectCategoryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(projectCategory$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.projectCategory = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Project Category Details',
        label: 'Project Category Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.projectCategory,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
