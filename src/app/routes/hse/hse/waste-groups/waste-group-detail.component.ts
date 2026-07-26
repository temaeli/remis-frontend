import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_WASTE_GROUP_BY_UID } from './waste-group.graphql';
import { wasteGroupUpsertBtn, wasteGroupDeleteBtn, wasteGroup$ } from './waste-group.form';
import { GET_WASTE_CATEGORIES_BY_GROUP } from '../waste-categories/waste-category.graphql';
import {
  wasteCategoryTableBtnsForGroup,
  wasteCategoryUpsertBtnForGroup,
  wasteCategory$,
} from '../waste-categories/waste-category.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'waste-group-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="group"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WasteGroupDetailComponent extends BaseComponent implements OnInit {
  override title = 'Waste Group';
  override subtitle = 'Waste Group Details';

  group: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [wasteGroupUpsertBtn(this), wasteGroupDeleteBtn(this)];

  private groupUid = this.route.snapshot?.paramMap?.get('wasteGroupUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WASTE_GROUP_BY_UID,
    variables: { uid: this.groupUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(wasteGroup$.subscribe(() => this.setContents()));
    this.subs.add(wasteCategory$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.group = await this.fs.fetch(this.fetchParameter);
    this.title = this.group?.name ?? this.title;
    const viewGroup = formatEntityDates(this.group);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'reference',
          entity: viewGroup,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
          ],
          specifications: [{ key: 'description', label: 'Description' }],
        }),
      },
      {
        type: 'table',
        name: 'Categories',
        label: 'Categories',
        icon: 'category',
        permissions: ['ROLE_VIEW_WASTE_CATEGORY'],
        keyColumns: [
          'index',
          'code',
          'name',
          {
            field: 'recyclable',
            header: 'Recyclable',
            valueFn: (row: any) => (row?.recyclable ? 'Yes' : 'No'),
          },
          'description',
          'actions',
        ],
        actionButtons: wasteCategoryTableBtnsForGroup(this, this.groupUid ?? ''),
        reloadActions$: [wasteCategory$],
        fetchParameter: {
          query: GET_WASTE_CATEGORIES_BY_GROUP,
          variables: { wasteGroupUid: this.groupUid, pageableParam: { size: 10 } },
        },
        hasActionsColumn: true,
        theme: 'simple',
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => this.router.navigate(['/hse/waste-categories', data.uid]),
          },
        ],
        headerButtons: [wasteCategoryUpsertBtnForGroup(this, this.groupUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
