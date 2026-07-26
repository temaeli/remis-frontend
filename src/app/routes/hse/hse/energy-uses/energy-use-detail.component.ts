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
import { GET_ENERGY_USE_BY_UID, GET_TOTAL_ENERGY_USAGE_BY_USE } from './energy-use.graphql';
import { energyUseUpsertBtn, energyUseDeleteBtn, energyUse$ } from './energy-use.form';
import { GET_ENERGY_USAGES_BY_ENERGY_USE } from '../energy-usages/energy-usage.graphql';
import {
  energyUsageTableBtnsForEnergyUse,
  energyUsageUpsertBtnForEnergyUse,
  energyUsage$,
} from '../energy-usages/energy-usage.form';
import { GET_EMISSION_SUBSTANCES_BY_ENERGY_USE } from '../emission-substances/emission-substance.graphql';
import {
  emissionSubstanceTableBtns,
  emissionSubstanceUpsertBtnForEnergyUse,
  emissionSubstance$,
} from '../emission-substances/emission-substance.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'energy-use-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="energyUse"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class EnergyUseDetailComponent extends BaseComponent implements OnInit {
  override title = 'Energy Use';
  override subtitle = 'Energy Use Details';

  energyUse: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [energyUseUpsertBtn(this), energyUseDeleteBtn(this)];

  private energyUseUid = this.route.snapshot?.paramMap?.get('energyUseUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_ENERGY_USE_BY_UID,
    variables: { uid: this.energyUseUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(energyUse$.subscribe(() => this.setContents()));
    this.subs.add(energyUsage$.subscribe(() => this.setContents()));
    this.subs.add(emissionSubstance$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.energyUse = await this.fs.fetch(this.fetchParameter);
    this.title = this.energyUse?.name ?? this.title;
    const unit = unitSymbol(this.energyUse?.unitOfMeasure);

    const totalRes = await this.fs.fetch({
      query: GET_TOTAL_ENERGY_USAGE_BY_USE,
      variables: { uid: this.energyUseUid },
    });
    const totalUsed = `${Number(totalRes?.data ?? totalRes ?? 0).toFixed(2)} ${unit}`.trim();

    const viewEnergyUse = {
      ...formatEntityDates(this.energyUse),
      unitOfMeasure: unit,
      totalEnergyUsed: totalUsed,
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
          entity: viewEnergyUse,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'unitOfMeasure', label: 'Unit of Measure' },
          ],
          specifications: [
            { key: 'description', label: 'Description' },
            { key: 'totalEnergyUsed', label: 'Total Energy Used' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Usages',
        label: 'Usages',
        icon: 'list',
        permissions: ['ROLE_VIEW_ENERGY_USAGE'],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          { field: 'workingStation.name', header: 'Working Station' },
          {
            field: 'amountUsed',
            header: 'Amount Used',
            valueFn: (row: any) =>
              `${Number(row?.amountUsed ?? 0).toFixed(2)} ${unitSymbol(row?.unitOfMeasure)}`.trim(),
          },
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
          },
          'actions',
        ],
        actionButtons: energyUsageTableBtnsForEnergyUse(this, this.energyUseUid ?? '', unit),
        reloadActions$: [energyUsage$],
        fetchParameter: {
          query: GET_ENERGY_USAGES_BY_ENERGY_USE,
          variables: { energyUseUid: this.energyUseUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [energyUsageUpsertBtnForEnergyUse(this, this.energyUseUid ?? '', unit)],
      },
      {
        type: 'table',
        name: 'Substances',
        label: 'Emission Substances',
        icon: 'cloud_download',
        permissions: ['ROLE_VIEW_EMISSION_SUBSTANCE'],
        keyColumns: [
          'index',
          'code',
          'name',
          'unitOfMeasure',
          {
            field: 'conversionFactor',
            header: 'Conversion Factor',
            valueFn: (row: any) => Number(row?.conversionFactor ?? 0).toFixed(4),
          },
          'actions',
        ],
        actionButtons: emissionSubstanceTableBtns(this),
        reloadActions$: [emissionSubstance$],
        fetchParameter: {
          query: GET_EMISSION_SUBSTANCES_BY_ENERGY_USE,
          variables: { energyUseUid: this.energyUseUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [emissionSubstanceUpsertBtnForEnergyUse(this, this.energyUseUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
