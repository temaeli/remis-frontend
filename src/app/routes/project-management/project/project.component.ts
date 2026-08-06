import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

import { RegistryProject } from '../project-registry.interface';
import { FIND_REGISTRY_PROJECT } from './project.graphql';
import { registryProject$, registryProjectUpsertBtn } from './project.form';

@Component({
  selector: 'app-project',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="registryProject"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class RegistryProjectComponent extends BaseComponent implements OnInit {
  override title = 'Project';
  override subtitle = 'Project Details';

  registryProject: RegistryProject | undefined;
  registryProjectUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [registryProjectUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_REGISTRY_PROJECT,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.registryProjectUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(registryProject$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const response = await this.fs.fetch(this.fetchParameter);
    this.registryProject = response?.data ?? response;

    this.contents = [
      {
        type: 'details',
        name: 'Project Details',
        label: 'Project Details',
        icon: 'notes',
        showUndefined: true,
        entity: this.registryProject,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
