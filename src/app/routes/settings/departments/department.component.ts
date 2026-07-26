import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

import { Department } from './department.interface';
import { FIND_DEPARTMENT } from './department.graphql';
import { departmentUpsertBtn, department$ } from './department.form';

@Component({
  selector: 'app-department.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="department"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class DepartmentComponent extends BaseComponent implements OnInit {
  override title = 'Department';
  override subtitle = 'Department Management';

  department: Department | undefined;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [departmentUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_DEPARTMENT,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.route.snapshot?.paramMap?.get('departmentUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(department$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.department = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.department,
        fetchParameter: this.fetchParameter,
      },
    ];
  }
}
