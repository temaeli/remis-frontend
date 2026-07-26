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
import { GET_WORKING_STATION_BY_UID } from './working-station.graphql';
import {
  workingStationUpsertBtn,
  workingStationDeleteBtn,
  workingStation$,
} from './working-station.form';
import { GET_POWER_GENERATORS_BY_STATION } from '../power-generators/power-generator.graphql';
import {
  powerGeneratorTableBtns,
  powerGeneratorUpsertBtn,
  powerGenerator$,
} from '../power-generators/power-generator.form';
import { GET_FUEL_TANKS_BY_WORKSTATION } from '../fuel-tanks/tank.graphql';
import {
  tankTableBtns,
  tankUpsertBtnForWorkingStation,
  powerGeneratorTank$,
} from '../fuel-tanks/tank.form';
import { GET_MANPOWER_ATTENDANCES_BY_STATION } from '../../security/manpower-attendances/manpower-attendance.graphql';
import {
  attendanceViewBtns,
  manpowerAttendance$,
} from '../../security/manpower-attendances/manpower-attendance.form';
import { GET_USER_WORKSTATIONS_BY_STATION } from './user-workstation.graphql';
import {
  userWorkstation$,
  userWorkstationAssignBtn,
  userWorkstationTableBtns,
} from './user-workstation.form';
import { processStatusFromTimestamps } from '@shared/crud';

@Component({
  selector: 'working-station-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="station"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WorkingStationDetailComponent extends BaseComponent implements OnInit {
  override title = 'Working Station';
  override subtitle = 'Working Station Details';

  station: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    workingStationUpsertBtn(this),
    workingStationDeleteBtn(this),
  ];

  private workingStationUid = this.route.snapshot?.paramMap?.get('workingStationUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WORKING_STATION_BY_UID,
    variables: { uid: this.workingStationUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(workingStation$.subscribe(() => this.setContents()));
    this.subs.add(powerGenerator$.subscribe(() => this.setContents()));
    this.subs.add(powerGeneratorTank$.subscribe(() => this.setContents()));
    this.subs.add(manpowerAttendance$.subscribe(() => this.setContents()));
    this.subs.add(userWorkstation$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.station = await this.fs.fetch(this.fetchParameter);
    this.title = this.station?.name ?? this.title;
    const viewStation = formatEntityDates(this.station);
    const stationUid = this.workingStationUid ?? '';

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'entity',
          entity: viewStation,
          identity: [
            { key: 'code', label: 'Station Code' },
            { key: 'name', label: 'Station Name' },
            'description',
          ],
        }),
      },
      {
        type: 'table',
        name: 'Standby Generators',
        label: 'Standby Generators',
        icon: 'flash',
        permissions: ['ROLE_VIEW_POWER_GENERATOR', 'ROLE_MANAGE_POWER_GENERATOR'],
        keyColumns: [
          'index',
          'code',
          'name',
          'capacityKva',
          { field: 'status', header: 'Generator Status' },
          'actions',
        ],
        actionButtons: powerGeneratorTableBtns(this),
        reloadActions$: [powerGenerator$],
        fetchParameter: {
          query: GET_POWER_GENERATORS_BY_STATION,
          variables: { stationUid: this.workingStationUid, active: true },
        },
        gridOptions: [
          { title: 'Active Standby Generators', label: 'Active', queryVariables: { active: true } },
          {
            title: 'Inactive Standby Generators',
            label: 'Inactive',
            queryVariables: { active: false },
          },
        ],
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [powerGeneratorUpsertBtn(this)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'standby-generators', data.uid),
          },
        ],
      },
      {
        type: 'table',
        name: 'Fuel Tanks',
        label: 'Fuel Tanks',
        icon: 'natural_gas',
        permissions: ['ROLE_VIEW_POWER_GENERATOR_TANK', 'ROLE_MANAGE_POWER_GENERATOR_TANK'],
        keyColumns: [
          'index',
          'name',
          'capacityInLitres',
          'minimumVolume',
          { field: 'createdAt', type: 'date' },
          'actions',
        ],
        actionButtons: tankTableBtns(this),
        reloadActions$: [powerGeneratorTank$],
        fetchParameter: {
          query: GET_FUEL_TANKS_BY_WORKSTATION,
          variables: { generatorUid: stationUid, active: true },
        },
        gridOptions: [
          { title: 'Active Fuel Tanks', label: 'Active', queryVariables: { active: true } },
          { title: 'Inactive Fuel Tanks', label: 'Inactive', queryVariables: { active: false } },
        ],
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [tankUpsertBtnForWorkingStation(this, stationUid)],
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'fuel-tanks', data.uid),
          },
        ],
      },
      {
        type: 'table',
        name: 'Assigned Users',
        label: 'Assigned Users',
        icon: 'user_group',
        permissions: ['ROLE_VIEW_USER_WORKSTATION', 'ROLE_MANAGE_USER_WORKSTATION'],
        keyColumns: [
          'index',
          { field: 'user.fullName', header: 'Name' },
          { field: 'user.email', header: 'Email' },
          { field: 'user.designation.title', header: 'Designation' },
          { field: 'createdAt', header: 'Assigned On', type: 'dateTime' },
          'actions',
        ],
        actionButtons: userWorkstationTableBtns(this),
        reloadActions$: [userWorkstation$],
        fetchParameter: {
          query: GET_USER_WORKSTATIONS_BY_STATION,
          variables: { stationUid },
          // BE returns all history rows; UI shows currently-assigned only.
          // Never pass `active` — that pageable arg is broken on this query.
          resMapFn: (res: any) => ({
            ...(res ?? {}),
            content: ((res?.content ?? []) as any[]).filter((r) => r?.current),
          }),
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [
          userWorkstationAssignBtn(this, stationUid, this.station?.name),
        ],
      },
      {
        type: 'table',
        name: 'Attendances',
        label: 'Attendances',
        icon: 'group',
        permissions: ['ROLE_VIEW_MANPOWER_ATTENDANCE'],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          {
            field: 'totalAttended',
            header: 'Total',
            valueFn: (row: any) =>
              (row?.manpowerAttended ?? []).reduce(
                (s: number, r: any) => s + (r?.attended ?? 0),
                0,
              ),
          },
          {
            field: 'status',
            header: 'Approval Status',
            valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
          },
          'actions',
        ],
        actionButtons: attendanceViewBtns(this),
        reloadActions$: [manpowerAttendance$],
        fetchParameter: {
          query: GET_MANPOWER_ATTENDANCES_BY_STATION,
          variables: { sectionUid: this.workingStationUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        viewDetailsClicks: 1,
        rowClickActions: [
          {
            callback: (data: any) => navigateRelativeTo(this, 'manpower-attendances', data.uid),
          },
        ],
      },
    ];

    this.cdr.detectChanges();
  }
}
