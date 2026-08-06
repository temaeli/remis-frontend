import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { ProjectSubcategory } from '../project-registry.interface';
import { FIND_PROJECT_SUBCATEGORY } from './project-subcategory.graphql';
import { projectSubcategory$, projectSubcategoryUpsertBtn } from './project-subcategory.form';

@Component({
  selector: 'app-project-subcategory',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="projectSubcategory"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ProjectSubcategoryComponent extends BaseComponent implements OnInit {
  override title = 'Project Subcategory';
  override subtitle = 'Project Subcategory Details';

  projectSubcategory: ProjectSubcategory | undefined;
  projectSubcategoryUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [projectSubcategoryUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PROJECT_SUBCATEGORY,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.projectSubcategoryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(projectSubcategory$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.projectSubcategory = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Project Subcategory Details',
        label: 'Project Subcategory Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.projectSubcategory,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
