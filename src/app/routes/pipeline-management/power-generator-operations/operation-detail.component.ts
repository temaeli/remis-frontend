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
import { GET_POWER_GENERATOR_OPERATION_BY_UID } from './operation.graphql';
import {
  operationUpsertBtn,
  operationSubmitBtn,
  operationApproveBtn,
  operationRejectBtn,
  operationDeleteBtn,
  powerGeneratorOperation$,
} from './operation.form';

@Component({
  selector: 'operation-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="operation"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class OperationDetailComponent extends BaseComponent implements OnInit {
  override title = 'Standby Generator Operation';
  override subtitle = 'Operation Details';

  operation: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    operationUpsertBtn(this),
    operationSubmitBtn(this),
    operationApproveBtn(this),
    operationRejectBtn(this),
    operationDeleteBtn(this),
  ];

  private operationUid = this.route.snapshot?.paramMap?.get('powerGeneratorOperationUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_POWER_GENERATOR_OPERATION_BY_UID,
    successFn: (res) => {
      const generatorName = res?.data?.powerGenerator?.name;
      if (generatorName) this.title = `Operation — ${generatorName}`;
    },
    variables: { uid: this.operationUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(powerGeneratorOperation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.operation = await this.fs.fetch(this.fetchParameter);
    const viewOperation = formatEntityDates(this.operation);
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const generator = viewOperation?.powerGenerator;
    const enrichedOperation = {
      ...(viewOperation ?? {}),
      generatorLabel: generator
        ? [generator.code, generator.name].filter(Boolean).join(' — ')
        : undefined,
      approvedByName: fullName(viewOperation?.approvedBy),
      rejectedByName: fullName(viewOperation?.rejectedBy),
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
          entity: enrichedOperation,
          identity: [{ key: 'date', label: 'Operation Date' }],
          context: [{ key: 'generatorLabel', label: 'Standby Generator' }],
          specifications: [
            { key: 'fuelLevel', label: 'Fuel Level (L)' },
            { key: 'fuelConsumed', label: 'Fuel Consumed (L)' },
            { key: 'runHours', label: 'Hours This Run' },
            { key: 'accumulatedRunHours', label: 'Total Running Hours' },
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
