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
import { GET_WASTE_GENERATION_LOG_BY_UID } from './waste-generation-log.graphql';
import {
  wasteGenerationLogUpsertBtn,
  wasteGenerationLogSubmitBtn,
  wasteGenerationLogApproveBtn,
  wasteGenerationLogRejectBtn,
  wasteGenerationLogDeleteBtn,
  wasteGenerationLog$,
} from './waste-generation-log.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'waste-generation-log-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="log"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WasteGenerationLogDetailComponent extends BaseComponent implements OnInit {
  override title = 'Waste Generation Log';
  override subtitle = 'Daily waste generation record';

  log: any;
  override contents: ContentParameter[] = [];

  private logUid =
    this.route.snapshot?.paramMap?.get('logUid') ?? this.route.snapshot?.paramMap?.get('uid');

  override actionButtons: ActionButton[] = [
    wasteGenerationLogUpsertBtn(this),
    wasteGenerationLogSubmitBtn(this),
    wasteGenerationLogApproveBtn(this),
    wasteGenerationLogRejectBtn(this),
    wasteGenerationLogDeleteBtn(this, () =>
      this.router.navigateByUrl('/hse/waste-generation-logs'),
    ),
  ];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WASTE_GENERATION_LOG_BY_UID,
    variables: { uid: this.logUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(wasteGenerationLog$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.log = await this.fs.fetch(this.fetchParameter);
    const headerCategory = this.log?.wasteCategory?.name;
    if (headerCategory) this.subtitle = `${headerCategory} — daily log`;

    const viewLog = formatEntityDates(this.log, { extraDateTimeKeys: [] });
    const enriched = {
      ...(viewLog ?? {}),
      wasteCategoryName: viewLog?.wasteCategory?.name,
      workingStationName: viewLog?.workingStation?.name,
      status: processStatusFromTimestamps(viewLog ?? {}),
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
            { key: 'date', label: 'Date' },
            { key: 'submittedAt', label: 'Submitted On' },
            { key: 'approvedAt', label: 'Approved On' },
            { key: 'rejectedAt', label: 'Rejected On' },
          ],
          context: [
            { key: 'wasteCategoryName', label: 'Waste Category' },
            { key: 'workingStationName', label: 'Working Station' },
          ],
          specifications: [
            { key: 'amountGenerated', label: 'Amount Generated' },
            { key: 'amountRecycled', label: 'Amount Recycled' },
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
