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
import { GET_WATER_USE_BY_UID, GET_TOTAL_WATER_USAGE_BY_WATER_USE } from './water-use.graphql';
import { waterUseUpsertBtn, waterUseDeleteBtn, waterUse$ } from './water-use.form';
import { GET_WATER_USAGES_BY_WATER_USE } from '../water-usages/water-usage.graphql';
import {
  waterUsageTableBtnsForWaterUse,
  waterUsageUpsertBtnForWaterUse,
  waterUsage$,
} from '../water-usages/water-usage.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'water-use-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="waterUse"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WaterUseDetailComponent extends BaseComponent implements OnInit {
  override title = 'Water Use';
  override subtitle = 'Water Use Details';

  waterUse: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [waterUseUpsertBtn(this), waterUseDeleteBtn(this)];

  private waterUseUid = this.route.snapshot?.paramMap?.get('waterUseUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WATER_USE_BY_UID,
    variables: { uid: this.waterUseUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(waterUse$.subscribe(() => this.setContents()));
    this.subs.add(waterUsage$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.waterUse = await this.fs.fetch(this.fetchParameter);
    this.title = this.waterUse?.name ?? this.title;

    const totalRes = await this.fs.fetch({
      query: GET_TOTAL_WATER_USAGE_BY_WATER_USE,
      variables: { waterUseUid: this.waterUseUid },
    });
    const totalUsed = Number(totalRes?.data ?? totalRes ?? 0).toFixed(2);

    const viewWaterUse = {
      ...formatEntityDates(this.waterUse),
      totalWaterUsed: totalUsed,
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
          entity: viewWaterUse,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
          ],
          specifications: [
            { key: 'description', label: 'Description' },
            { key: 'totalWaterUsed', label: 'Total Water Used' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Usages',
        label: 'Usages',
        icon: 'list',
        permissions: ['ROLE_VIEW_WATER_USAGE'],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          { field: 'workingStation.name', header: 'Working Station' },
          {
            field: 'meterReading',
            header: 'Meter Reading',
            valueFn: (row: any) => Number(row?.meterReading ?? 0).toFixed(2),
          },
          {
            field: 'amountUsed',
            header: 'Amount Used',
            valueFn: (row: any) => Number(row?.amountUsed ?? 0).toFixed(2),
          },
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
          },
          'actions',
        ],
        actionButtons: waterUsageTableBtnsForWaterUse(this, this.waterUseUid ?? ''),
        reloadActions$: [waterUsage$],
        fetchParameter: {
          query: GET_WATER_USAGES_BY_WATER_USE,
          variables: { waterUseUid: this.waterUseUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [waterUsageUpsertBtnForWaterUse(this, this.waterUseUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
