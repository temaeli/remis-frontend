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
import { GET_WATER_USAGE_BY_UID } from './water-usage.graphql';
import {
  waterUsageUpsertBtn,
  waterUsageSubmitBtn,
  waterUsageApproveBtn,
  waterUsageRejectBtn,
  waterUsageDeleteBtn,
  waterUsage$,
} from './water-usage.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'water-usage-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="usage"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WaterUsageDetailComponent extends BaseComponent implements OnInit {
  override title = 'Water Usage';
  override subtitle = 'Daily water meter reading';

  usage: any;
  override contents: ContentParameter[] = [];

  private usageUid =
    this.route.snapshot?.paramMap?.get('usageUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    waterUsageUpsertBtn(this),
    waterUsageSubmitBtn(this),
    waterUsageApproveBtn(this),
    waterUsageRejectBtn(this),
    waterUsageDeleteBtn(this, () => this.router.navigateByUrl('/hse/water-usages')),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WATER_USAGE_BY_UID,
    variables: { uid: this.usageUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(waterUsage$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.usage = await this.fs.fetch(this.fetchParameter);
    const headerUse = this.usage?.waterUse?.name;
    if (headerUse) this.subtitle = `${headerUse} — daily reading`;

    const viewUsage = formatEntityDates(this.usage, { extraDateTimeKeys: [] });
    const enriched = {
      ...(viewUsage ?? {}),
      waterUseName: viewUsage?.waterUse?.name,
      workingStationName: viewUsage?.workingStation?.name,
      status: processStatusFromTimestamps(viewUsage ?? {}),
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'event',
          entity: enriched,
          identity: [
            { key: 'date', label: 'Month' },
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'rejectedAt', label: 'Rejected On' },
          ],
          context: [
            { key: 'waterUseName', label: 'Water Use' },
            { key: 'workingStationName', label: 'Working Station' },
          ],
          specifications: [
            { key: 'meterReading', label: 'Meter Reading' },
            { key: 'amountUsed', label: 'Amount Used' },
            { key: 'remarks', label: 'Remarks' },
            { key: 'status', label: 'Status' },
            { key: 'comment', label: 'Approval / Rejection Comment' },
          ],
        }),
      },
    ];

    this.cdr.detectChanges();
  }
}
