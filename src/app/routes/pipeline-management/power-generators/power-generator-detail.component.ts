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
import {
  GET_POWER_GENERATOR_BY_UID,
  GET_POWER_GENERATOR_FUEL_LEVEL,
  GET_POWER_GENERATOR_TOTAL_RUN_HOURS,
} from './power-generator.graphql';
import { powerGenerator$ } from './power-generator.form';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { GET_EQUIPMENT_REFUELS_BY_GENERATOR } from '../power-generator-refuels/refuel.graphql';
import {
  refuelTableBtns,
  refuelUpsertBtnForGenerator,
  powerGeneratorRefuel$,
} from '../power-generator-refuels/refuel.form';
import { GET_POWER_GENERATOR_OPERATIONS_BY_GENERATOR } from '../power-generator-operations/operation.graphql';
import {
  operationTableBtns,
  operationUpsertBtnForGenerator,
  powerGeneratorOperation$,
} from '../power-generator-operations/operation.form';
import { ProcessStatus, processStatusFromTimestamps } from '@shared/crud';

@Component({
  selector: 'power-generator-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="generator"
      />

      <div
        *ngIf="fuelLevelLoaded"
        class="rounded-lg bg-white px-4 py-3 flex items-center gap-4 border border-gray-100"
      >
        <div class="flex flex-col min-w-[180px]">
          <span class="text-xs uppercase tracking-wider faded">Live Fuel Level</span>
          <span class="text-xl font-semibold tabular-nums">
            <ng-container *ngIf="fuelLevel !== null; else fuelMissing">
              {{ fuelLevel | number: '1.0-2' }} L
              <span class="text-sm faded font-normal" *ngIf="capacityLitres">
                / {{ capacityLitres | number: '1.0-0' }} L
              </span>
            </ng-container>
            <ng-template #fuelMissing>0</ng-template>
          </span>
        </div>

        <div class="flex-1 flex flex-col gap-1" *ngIf="fuelPercent !== null">
          <div class="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              [class.bg-success]="fuelTier === 'high'"
              [class.bg-warning]="fuelTier === 'mid'"
              [class.bg-danger]="fuelTier === 'low'"
              [style.width.%]="fuelPercent"
            ></div>
          </div>
          <span class="text-xs faded tabular-nums">{{ fuelPercent | number: '1.0-0' }}% full</span>
        </div>

        <div class="flex flex-col min-w-[160px] border-l border-gray-100 pl-4">
          <span class="text-xs uppercase tracking-wider faded">Total Running Hours</span>
          <span class="text-xl font-semibold tabular-nums">
            {{ totalRunHours !== null ? (totalRunHours | number: '1.0-2') + ' hrs' : '0 hrs' }}
          </span>
        </div>
      </div>

      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PowerGeneratorDetailComponent extends BaseComponent implements OnInit {
  override title = 'Standby Generator';
  override subtitle = 'Standby Generator Details';

  generator: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fuelLevel: number | null = null;
  fuelLevelLoaded = false;
  capacityLitres: number | null = null;
  fuelPercent: number | null = null;
  fuelTier: 'high' | 'mid' | 'low' | null = null;
  totalRunHours: number | null = null;

  private powerGeneratorUid = this.route.snapshot?.paramMap?.get('powerGeneratorUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_POWER_GENERATOR_BY_UID,
    variables: { uid: this.powerGeneratorUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    await this.refreshFuelLevel();
    await this.refreshTotalRunHours();
    this.subs.add(powerGenerator$.subscribe(() => this.setContents()));
    this.subs.add(
      powerGeneratorRefuel$.subscribe(async () => {
        this.cdr.detach();
        await this.setContents();
        this.cdr.reattach();
        this.cdr.detectChanges();
        await this.refreshFuelLevel();
      }),
    );
    this.subs.add(
      powerGeneratorOperation$.subscribe(async () => {
        this.cdr.detach();
        await this.setContents();
        this.cdr.reattach();
        this.cdr.detectChanges();
        await this.refreshFuelLevel();
        await this.refreshTotalRunHours();
      }),
    );
  }

  async refreshFuelLevel(): Promise<void> {
    if (!this.powerGeneratorUid) return;
    try {
      // FetchService.mapResponse already unwraps `.data`, so this resolves
      // straight to the Double payload (or null when the response is empty).
      const litres = await this.fs.fetch({
        query: GET_POWER_GENERATOR_FUEL_LEVEL,
        variables: { uid: this.powerGeneratorUid },
      });
      this.fuelLevel = typeof litres === 'number' ? litres : null;
      this.capacityLitres = this.generator?.fuelTankCapacityLiters ?? null;
      if (this.fuelLevel !== null && this.capacityLitres) {
        const pct = Math.max(0, Math.min(100, (this.fuelLevel / this.capacityLitres) * 100));
        this.fuelPercent = pct;
        this.fuelTier = pct >= 50 ? 'high' : pct >= 25 ? 'mid' : 'low';
      } else {
        this.fuelPercent = null;
        this.fuelTier = null;
      }
    } finally {
      this.fuelLevelLoaded = true;
      this.cdr.detectChanges();
    }
  }

  async refreshTotalRunHours(): Promise<void> {
    if (!this.powerGeneratorUid) return;
    // FetchService.mapResponse unwraps `.data`, so this resolves to the Double payload.
    const hours = await this.fs.fetch({
      query: GET_POWER_GENERATOR_TOTAL_RUN_HOURS,
      variables: { generatorUid: this.powerGeneratorUid },
    });
    this.totalRunHours = typeof hours === 'number' ? hours : null;
    this.cdr.detectChanges();
  }

  async setContents(): Promise<void> {
    this.generator = await this.fs.fetch(this.fetchParameter);
    this.title = this.generator?.name ?? this.title;
    const generatorUid = this.powerGeneratorUid ?? '';
    const viewGenerator = formatEntityDates(this.generator);
    const enrichedGenerator = {
      ...(viewGenerator ?? {}),
      workStationName: viewGenerator?.workStation?.name,
    };

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'entity',
          entity: enrichedGenerator,
          identity: [
            { key: 'code', label: 'Generator Code' },
            { key: 'name', label: 'Generator Name' },
            { key: 'status', label: 'Generator Status' },
            { key: 'conditionStatus', label: 'Condition' },
          ],
          context: [
            { key: 'workStationName', label: 'Working Station' },
            { key: 'serialNumber', label: 'Serial Number' },
            { key: 'manufacturer', label: 'Manufacturer' },
            { key: 'model', label: 'Model' },
          ],
          specifications: [
            { key: 'capacityKva', label: 'Capacity (kVA)' },
            { key: 'capacityKw', label: 'Capacity (kW)' },
            { key: 'voltage', label: 'Voltage' },
            { key: 'frequencyHz', label: 'Frequency (Hz)' },
            { key: 'phaseType', label: 'Phase Type' },
            { key: 'powerFactor', label: 'Power Factor' },
            { key: 'fuelType', label: 'Fuel Type' },
            { key: 'fuelTankCapacityLiters', label: 'Fuel Tank Capacity (L)' },
            { key: 'minimumVolume', label: 'Minimum Volume (L)' },
            { key: 'fuelConsumptionPerHour', label: 'Fuel Consumption (L/hr)' },
            { key: 'engineManufacturer', label: 'Engine Manufacturer' },
            { key: 'engineModel', label: 'Engine Model' },
            { key: 'engineNumber', label: 'Engine Number' },
            { key: 'installationDate', label: 'Installation Date' },
            { key: 'commissioningDate', label: 'Commissioning Date' },
            { key: 'operatingHours', label: 'Operating Hours' },
            { key: 'lastServiceDate', label: 'Last Service Date' },
            { key: 'nextServiceDate', label: 'Next Service Date' },
            { key: 'maintenanceIntervalHours', label: 'Maintenance Interval (hrs)' },
          ],
          operational: [{ key: 'remarks', label: 'Remarks' }],
        }),
      },
      {
        type: 'table',
        name: 'Daily Tank Refuels',
        label: 'Daily Tank Refuels',
        icon: 'refresh',
        permissions: ['ROLE_VIEW_EQUIPMENT_REFUEL', 'ROLE_MANAGE_EQUIPMENT_REFUEL'],
        keyColumns: [
          'index',
          { field: 'generatorTank.name', header: 'Tank' },
          { field: 'date', type: 'date' },
          {
            field: 'quantityInLitres',
            valueFn: (row: any) => Number(row?.quantityInLitres ?? 0).toFixed(2),
          },
          'newVolume',
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
            valueClassMapper: (row: any) => {
              const s = processStatusFromTimestamps(row);
              if (s === ProcessStatus.APPROVED) return 'text-success';
              if (s === ProcessStatus.SUBMITTED) return 'text-primary';
              if (s === ProcessStatus.DRAFT) return 'text-warning';
              if (s === ProcessStatus.REJECTED) return 'text-danger';
              return '';
            },
          },
          'actions',
        ],
        actionButtons: refuelTableBtns(this),
        reloadActions$: [powerGeneratorRefuel$],
        fetchParameter: {
          query: GET_EQUIPMENT_REFUELS_BY_GENERATOR,
          variables: { generatorUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [refuelUpsertBtnForGenerator(this, generatorUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'equipment-refuels', data.uid),
          },
        ],
      },
      {
        type: 'table',
        name: 'Daily Tank Operations',
        label: 'Daily Tank Operations',
        icon: 'flash',
        permissions: [
          'ROLE_VIEW_POWER_GENERATOR_OPERATION',
          'ROLE_MANAGE_POWER_GENERATOR_OPERATION',
        ],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          'fuelLevel',
          'fuelConsumed',
          { field: 'accumulatedRunHours', header: 'Total Running Hours' },
          { field: 'runHours', header: 'Hours This Run' },
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
            valueClassMapper: (row: any) => {
              const s = processStatusFromTimestamps(row);
              if (s === ProcessStatus.APPROVED) return 'text-success';
              if (s === ProcessStatus.SUBMITTED) return 'text-primary';
              if (s === ProcessStatus.DRAFT) return 'text-warning';
              if (s === ProcessStatus.REJECTED) return 'text-danger';
              return '';
            },
          },
          'actions',
        ],
        actionButtons: operationTableBtns(this),
        reloadActions$: [powerGeneratorOperation$],
        fetchParameter: {
          query: GET_POWER_GENERATOR_OPERATIONS_BY_GENERATOR,
          variables: { generatorUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [operationUpsertBtnForGenerator(this, generatorUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) =>
              navigateRelativeTo(this, 'power-generator-operations', data.uid),
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
