import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { Designation } from './designations.interface';
import { FIND_DESIGNATION, USERS_BY_DESIGNATION_PAGEABLE } from './designations.graphql';
import { designationUpsertBtn, designation$ } from './designations.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';

@Component({
  selector: 'app-designation',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="designation"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class DesignationComponent extends BaseComponent implements OnInit {
  override title = 'Designation';
  override subtitle = 'Designation Details';

  designation: Designation | undefined;
  designationUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [designationUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_DESIGNATION,
    successFn: (res) => (this.title = res?.data?.title),
    variables: { uid: this.designationUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(designation$.subscribe(() => this.setContents()));
  }

  async setContents() {
    const designation = await this.fs.fetch(this.fetchParameter);
    this.designation = designation?.data;

    const keyColumns: GridKeyColumn[] = [
      'index',
      'bioData.firstName as First Name',
      'bioData.thirdName as Last Name',
      'email',
      'bioData.mobileNumber as Phone Number',
      'active',
    ];

    const gridParameter: GridParameter = {
      title: 'Users with this Designation',
      icon: 'designation',
      keyColumns,
      isPageable: true,
      fetchParameter: {
        query: USERS_BY_DESIGNATION_PAGEABLE,
        variables: { designationUid: this.designationUid },
      },
    };

    this.contents = [
      {
        type: 'details',
        name: 'Designation Details',
        label: 'Designation Details',
        icon: 'notes',
        showUndefined: true,
        hiddenKeys: ['updatedAt', 'deletedAt', 'createdAt'],
        entity: this.designation,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'Associated Users',
        label: 'Associated Users',
        icon: 's-users',
        keyColumns,
        isPageable: true,
        fetchParameter: {
          query: USERS_BY_DESIGNATION_PAGEABLE,
          variables: { designationUid: this.designationUid },
        },
      },
    ];

    this.cdr.detectChanges();
  }
}
