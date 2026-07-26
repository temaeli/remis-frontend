import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { processStatusFromTimestamps } from '@shared/crud';
import { GET_WASTE_CATEGORY_BY_UID } from './waste-category.graphql';
import { wasteCategoryUpsertBtn, wasteCategoryDeleteBtn, wasteCategory$ } from './waste-category.form';
import { GET_WASTE_GENERATION_LOGS_BY_CATEGORY } from '../waste-generation-logs/waste-generation-log.graphql';
import {
  wasteGenerationLogTableBtnsForCategory,
  wasteGenerationLogUpsertBtnForCategory,
  wasteGenerationLog$,
} from '../waste-generation-logs/waste-generation-log.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'waste-category-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="category"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WasteCategoryDetailComponent extends BaseComponent implements OnInit {
  override title = 'Waste Category';
  override subtitle = 'Waste Category Details';

  category: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    wasteCategoryUpsertBtn(this),
    wasteCategoryDeleteBtn(this),
  ];

  private categoryUid = this.route.snapshot?.paramMap?.get('wasteCategoryUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WASTE_CATEGORY_BY_UID,
    variables: { uid: this.categoryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(wasteCategory$.subscribe(() => this.setContents()));
    this.subs.add(wasteGenerationLog$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.category = await this.fs.fetch(this.fetchParameter);
    this.title = this.category?.name ?? this.title;
    const viewCategory = formatEntityDates(this.category);
    const enrichedCategory = {
      ...(viewCategory ?? {}),
      wasteGroupLabel: viewCategory?.wasteGroup
        ? [viewCategory.wasteGroup.code, viewCategory.wasteGroup.name].filter(Boolean).join(' — ')
        : undefined,
      recyclableLabel: viewCategory?.recyclable ? 'Yes' : 'No',
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'reference',
          entity: enrichedCategory,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'wasteGroupLabel', label: 'Waste Group' },
            {
              key: 'recyclableLabel',
              label: 'Recyclable',
              valueClass: viewCategory?.recyclable
                ? 'text-emerald-600 font-semibold'
                : 'text-gray-500',
            },
          ],
          specifications: [{ key: 'description', label: 'Description' }],
        }),
      },
      {
        type: 'table',
        name: 'Generation Logs',
        label: 'Generation Logs',
        icon: 'list',
        permissions: ['ROLE_VIEW_WASTE_GENERATION_LOG'],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          { field: 'workingStation.name', header: 'Working Station' },
          {
            field: 'amountGenerated',
            header: 'Generated',
            valueFn: (row: any) => Number(row?.amountGenerated ?? 0).toFixed(2),
          },
          {
            field: 'amountRecycled',
            header: 'Recycled',
            valueFn: (row: any) => Number(row?.amountRecycled ?? 0).toFixed(2),
          },
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
          },
          'actions',
        ],
        actionButtons: wasteGenerationLogTableBtnsForCategory(this, this.categoryUid ?? ''),
        reloadActions$: [wasteGenerationLog$],
        fetchParameter: {
          query: GET_WASTE_GENERATION_LOGS_BY_CATEGORY,
          variables: { wasteCategoryUid: this.categoryUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [wasteGenerationLogUpsertBtnForCategory(this, this.categoryUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
