import { buildNarrative } from '../pipeline-module.constants';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_FLOW_METER_READING_BY_UID } from './flow-meter-reading.graphql';
import {
  flowMeterReading$,
  flowMeterReadingApproveBtn,
  flowMeterReadingDeleteBtn,
  flowMeterReadingEditBtn,
  flowMeterReadingRejectBtn,
  flowMeterReadingSubmitBtn,
} from './flow-meter-reading.form';

@Component({
  selector: 'flow-meter-reading-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="reading"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class FlowMeterReadingDetailComponent extends BaseComponent implements OnInit {
  override title = 'Flow Meter Reading';
  override subtitle = 'Flow Meter Reading Details';

  reading: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    flowMeterReadingEditBtn(this),
    flowMeterReadingSubmitBtn(this),
    flowMeterReadingApproveBtn(this),
    flowMeterReadingRejectBtn(this),
    flowMeterReadingDeleteBtn(this),
  ];

  private flowMeterReadingUid =
    this.route.snapshot?.paramMap?.get('flowMeterReadingUid') ?? '';

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_FLOW_METER_READING_BY_UID,
    variables: { uid: this.flowMeterReadingUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(flowMeterReading$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.reading = await this.fs.fetch(this.fetchParameter);
    const viewReading = formatEntityDates(this.reading, {
      extraDateTimeKeys: ['readingTime'],
    });
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const enrichedReading = {
      ...(viewReading ?? {}),
      pipelineName: viewReading?.pipeline?.name,
      clientLabel: viewReading?.client
        ? [viewReading.client.code, viewReading.client.contactPersonName]
            .filter(Boolean)
            .join(' — ')
        : undefined,
      approvedByName: fullName(viewReading?.approvedBy),
      rejectedByName: fullName(viewReading?.rejectedBy),
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
          entity: enrichedReading,
          identity: [{ key: 'readingTime', label: 'Reading Time' }],
          context: [
            { key: 'pipelineName', label: 'Pipeline' },
            { key: 'clientLabel', label: 'Downstream Client' },
          ],
          specifications: [
            { key: 'amount', label: 'Amount (MMSCFD)' },
            { key: 'remarks', label: 'Remarks' },
          ],
          operational: [
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'approvedByName', label: 'Approved By' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'rejectedByName', label: 'Rejected By' },
            { key: 'rejectedAt', label: 'Rejected On' },
            { key: 'comment', label: 'Review Comment' },
          ],
        }),
      },
    ];

    this.cdr.detectChanges();
  }
}
