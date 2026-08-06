import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { ProjectConnection } from '../project-registry.interface';
import { FIND_PROJECT_CONNECTION } from './project-connection.graphql';
import { projectConnection$, projectConnectionUpsertBtn } from './project-connection.form';

@Component({
  selector: 'app-project-connection',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="projectConnection"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ProjectConnectionComponent extends BaseComponent implements OnInit {
  override title = 'Project Connection';
  override subtitle = 'Project Connection Details';

  projectConnection: ProjectConnection | undefined;
  projectConnectionUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [projectConnectionUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PROJECT_CONNECTION,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.projectConnectionUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(projectConnection$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.projectConnection = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Project Connection Details',
        label: 'Project Connection Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.projectConnection,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
