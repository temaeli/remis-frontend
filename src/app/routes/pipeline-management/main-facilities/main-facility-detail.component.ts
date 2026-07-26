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
import { GET_MAIN_FACILITY_BY_UID } from './main-facility.graphql';
import { mainFacilityUpsertBtn, mainFacilityDeleteBtn, mainFacility$ } from './main-facility.form';
import { GET_MAIN_FACILITY_SCHEDULE_BY_FACILITY } from '../main-facility-schedules/main-facility-schedule.graphql';
import {
  mainFacilitySchedule$,
  mainFacilityScheduleTableBtns,
  mainFacilityScheduleUpsertBtnForFacility,
} from '../main-facility-schedules/main-facility-schedule.form';

@Component({
  selector: 'main-facility-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="facility"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class MainFacilityDetailComponent extends BaseComponent implements OnInit {
  override title = 'Main Facility';
  override subtitle = 'Main Facility Details';

  facility: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [mainFacilityUpsertBtn(this), mainFacilityDeleteBtn(this)];

  protected mainFacilityUid = this.route.snapshot?.paramMap?.get('mainFacilityUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_MAIN_FACILITY_BY_UID,
    variables: { uid: this.mainFacilityUid },
  };

  async ngOnInit(): Promise<void> {
    this.cdr.detach();
    await this.setContents();
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.subs.add(mainFacility$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.facility = await this.fs.fetch(this.fetchParameter);
    this.title = this.facility?.name ?? this.title;
    const facilityUid = this.mainFacilityUid ?? '';
    const viewFacility = formatEntityDates(this.facility);
    const enrichedFacility = {
      ...(viewFacility ?? {}),
      typeName: viewFacility?.type?.name,
      typeDescription: viewFacility?.type?.description,
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
          entity: enrichedFacility,
          identity: [
            { key: 'name', label: 'Name' },
            { key: 'code', label: 'Code' },
          ],
          context: [
            { key: 'typeName', label: 'Facility Type' },
            { key: 'typeDescription', label: 'Type Description' },
          ],
          specifications: [{ key: 'active', label: 'Active' }],
        }),
      },
      {
        type: 'table',
        name: 'Schedule',
        label: 'Schedule',
        icon: 'calendar',
        permissions: [
          'ROLE_VIEW_MAIN_FACILITY_SCHEDULE',
          'ROLE_MANAGE_MAIN_FACILITY_SCHEDULE',
        ],
        keyColumns: [
          'index',
          { field: 'date', type: 'date' },
          { field: 'online', header: 'Online (hrs)' },
          { field: 'offline', header: 'Offline (hrs)' },
          { field: 'downtime', header: 'Downtime (hrs)' },
          'remarks',
          'actions',
        ],
        actionButtons: mainFacilityScheduleTableBtns(this),
        reloadActions$: [mainFacilitySchedule$],
        fetchParameter: {
          query: GET_MAIN_FACILITY_SCHEDULE_BY_FACILITY,
          variables: { facilityUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [mainFacilityScheduleUpsertBtnForFacility(this, facilityUid)],
      },
    ];

    this.cdr.detectChanges();
  }
}
