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
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { ProcessStatus, processStatusFromTimestamps } from '@shared/crud';
import {
  GET_POWER_GENERATOR_TANK_BY_UID,
  GET_POWER_GENERATOR_TANK_FUEL_LEVEL,
} from './tank.graphql';
import { powerGeneratorTank$ } from './tank.form';
import { GET_GENERATOR_TANK_REFUELS_BY_TANK } from '../generator-tank-refuels/tank-refuel.graphql';
import {
  tankRefuelTableBtns,
  tankRefuelUpsertBtnForTank,
  generatorTankRefuel$,
} from '../generator-tank-refuels/tank-refuel.form';
import { GET_EQUIPMENT_REFUELS_BY_TANK } from '../power-generator-refuels/refuel.graphql';
import {
  powerGeneratorRefuel$,
  refuelTableBtns,
  refuelUpsertBtnForTank,
} from '../power-generator-refuels/refuel.form';
import { TankMonthlyBalanceComponent } from './tank-monthly-balance.component';

@Component({
  selector: 'fuel-management-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="tank"
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
      </div>

      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class FuelManagementDetailComponent extends BaseComponent implements OnInit {
  override title = 'Fuel Tank';
  override subtitle = 'Fuel Tank Details';

  tank: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [];

  fuelLevel: number | null = null;
  fuelLevelLoaded = false;
  capacityLitres: number | null = null;
  fuelPercent: number | null = null;
  fuelTier: 'high' | 'mid' | 'low' | null = null;

  private powerGeneratorTankUid = this.route.snapshot?.paramMap?.get('powerGeneratorTankUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_POWER_GENERATOR_TANK_BY_UID,
    variables: { uid: this.powerGeneratorTankUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    await this.refreshFuelLevel();
    this.subs.add(powerGeneratorTank$.subscribe(() => this.setContents()));
    this.subs.add(
      generatorTankRefuel$.subscribe(async () => {
        this.cdr.detach();
        await this.setContents();
        this.cdr.reattach();
        this.cdr.detectChanges();
        await this.refreshFuelLevel();
      }),
    );
    this.subs.add(
      powerGeneratorRefuel$.subscribe(async () => {
        this.cdr.detach();
        await this.setContents();
        this.cdr.reattach();
        this.cdr.detectChanges();
        await this.refreshFuelLevel();
      }),
    );
  }

  async refreshFuelLevel(): Promise<void> {
    if (!this.powerGeneratorTankUid) return;
    try {
      const litres = await this.fs.fetch({
        query: GET_POWER_GENERATOR_TANK_FUEL_LEVEL,
        variables: { uid: this.powerGeneratorTankUid },
      });
      this.fuelLevel = typeof litres === 'number' ? litres : null;
      this.capacityLitres = this.tank?.capacityInLitres ?? null;
      const min = this.tank?.minimumVolume ?? null;
      if (this.fuelLevel !== null && this.capacityLitres) {
        this.fuelPercent = Math.max(0, Math.min(100, (this.fuelLevel / this.capacityLitres) * 100));
      } else {
        this.fuelPercent = null;
      }
      if (this.fuelLevel !== null && min != null) {
        this.fuelTier =
          this.fuelLevel < min ? 'low' : this.fuelLevel < min * 1.25 ? 'mid' : 'high';
      } else {
        this.fuelTier = null;
      }
    } finally {
      this.fuelLevelLoaded = true;
      this.cdr.detectChanges();
    }
  }

  async setContents(): Promise<void> {
    this.tank = await this.fs.fetch(this.fetchParameter);
    this.title = this.tank?.name ?? this.title;
    const tankUid = this.powerGeneratorTankUid ?? '';
    const viewTank = formatEntityDates(this.tank);
    const enrichedTank = {
      ...(viewTank ?? {}),
      workingStationName: viewTank?.workingStation?.name,
      workingStationCode: viewTank?.workingStation?.code,
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
          entity: enrichedTank,
          identity: [{ key: 'name', label: 'Tank Name' }],
          context: [
            { key: 'workingStationName', label: 'Working Station' },
            { key: 'workingStationCode', label: 'Station Code' },
          ],
          specifications: [
            { key: 'capacityInLitres', label: 'Capacity (L)' },
            { key: 'minimumVolume', label: 'Minimum Volume (L)' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'Tank Refills',
        label: 'Tank Refills',
        icon: 'refresh',
        permissions: ['ROLE_VIEW_GENERATOR_TANK_REFUEL', 'ROLE_MANAGE_GENERATOR_TANK_REFUEL'],
        keyColumns: [
          'index',
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
        actionButtons: tankRefuelTableBtns(this),
        reloadActions$: [generatorTankRefuel$],
        fetchParameter: {
          query: GET_GENERATOR_TANK_REFUELS_BY_TANK,
          variables: { tankUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [tankRefuelUpsertBtnForTank(this, tankUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'generator-tank-refuels', data.uid),
          },
        ],
      },
      {
        type: 'table',
        name: 'Equipment Refuels',
        label: 'Equipment Refuels',
        icon: 'natural_gas',
        permissions: ['ROLE_VIEW_EQUIPMENT_REFUEL', 'ROLE_MANAGE_EQUIPMENT_REFUEL'],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          { field: 'equipmentType', header: 'Equipment Type' },
          { field: 'powerGenerator.name', header: 'Standby Generator' },
          {
            field: 'quantityInLitres',
            valueFn: (row: any) => Number(row?.quantityInLitres ?? 0).toFixed(2),
          },
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
          query: GET_EQUIPMENT_REFUELS_BY_TANK,
          variables: { tankUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [refuelUpsertBtnForTank(this, tankUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'equipment-refuels', data.uid),
          },
        ],
      },
      {
        type: 'component' as const,
        name: 'Monthly Balance',
        label: 'Monthly Balance',
        icon: 'report',
        permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK', 'ROLE_MANAGE_POWER_GENERATOR_TANK'],
        componentType: TankMonthlyBalanceComponent,
        componentInputs: {
          tankUid,
          tankName: this.tank?.name ?? 'tank',
        },
      },
    ];

    this.cdr.detectChanges();
  }
}
