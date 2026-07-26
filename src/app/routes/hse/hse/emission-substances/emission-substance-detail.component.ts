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
import { unitSymbol } from '../shared/unit-of-measure';
import {
  GET_EMISSION_SUBSTANCE_BY_UID,
  GET_TOTAL_EMISSION_BY_SUBSTANCE,
} from './emission-substance.graphql';
import {
  emissionSubstanceUpsertBtn,
  emissionSubstanceDeleteBtn,
  emissionSubstance$,
} from './emission-substance.form';
import { GET_EMISSION_LOGS_BY_SUBSTANCE } from '../emission-logs/emission-log.graphql';
import {
  emissionLogTableBtnsForSubstance,
  emissionLogUpsertBtnForSubstance,
  emissionLog$,
} from '../emission-logs/emission-log.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'emission-substance-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="emissionSubstance"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class EmissionSubstanceDetailComponent extends BaseComponent implements OnInit {
  override title = 'Emission Substance';
  override subtitle = 'Emission Substance Details';

  emissionSubstance: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    emissionSubstanceUpsertBtn(this),
    emissionSubstanceDeleteBtn(this),
  ];

  private emissionSubstanceUid = this.route.snapshot?.paramMap?.get('emissionSubstanceUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_EMISSION_SUBSTANCE_BY_UID,
    variables: { uid: this.emissionSubstanceUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(emissionSubstance$.subscribe(() => this.setContents()));
    this.subs.add(emissionLog$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.emissionSubstance = await this.fs.fetch(this.fetchParameter);
    this.title = this.emissionSubstance?.name ?? this.title;
    const unit = unitSymbol(this.emissionSubstance?.unitOfMeasure);

    const totalRes = await this.fs.fetch({
      query: GET_TOTAL_EMISSION_BY_SUBSTANCE,
      variables: { uid: this.emissionSubstanceUid },
    });
    const totalEmitted = `${Number(totalRes?.data ?? totalRes ?? 0).toFixed(2)} ${unit}`.trim();

    const viewSubstance = {
      ...formatEntityDates(this.emissionSubstance),
      unitOfMeasure: unit,
      totalEmitted,
      energyUseName: this.emissionSubstance?.energyUse?.name,
      conversionFactorLabel: Number(this.emissionSubstance?.conversionFactor ?? 0).toFixed(4),
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
          entity: viewSubstance,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'unitOfMeasure', label: 'Unit of Measure' },
            { key: 'energyUseName', label: 'Energy Use' },
          ],
          specifications: [
            { key: 'conversionFactorLabel', label: 'Conversion Factor' },
            { key: 'description', label: 'Description' },
            { key: 'totalEmitted', label: 'Total Emitted' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Logs',
        label: 'Logs',
        icon: 'list',
        permissions: ['ROLE_VIEW_EMISSION_LOG'],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          { field: 'workingStation.name', header: 'Working Station' },
          {
            field: 'amountEmitted',
            header: 'Amount Emitted',
            valueFn: (row: any) =>
              `${Number(row?.amountEmitted ?? 0).toFixed(2)} ${unitSymbol(row?.unitOfMeasure)}`.trim(),
          },
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
          },
          'actions',
        ],
        actionButtons: emissionLogTableBtnsForSubstance(
          this,
          this.emissionSubstanceUid ?? '',
          unit,
        ),
        reloadActions$: [emissionLog$],
        fetchParameter: {
          query: GET_EMISSION_LOGS_BY_SUBSTANCE,
          variables: { emissionSubstanceUid: this.emissionSubstanceUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [
          emissionLogUpsertBtnForSubstance(this, this.emissionSubstanceUid ?? '', unit),
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
