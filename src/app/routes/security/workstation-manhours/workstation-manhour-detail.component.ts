import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_WORKSTATION_MANHOUR_BY_UID } from './workstation-manhour.graphql';
import {
  workStationManHourUpsertBtn,
  workStationManHourDeleteBtn,
  workStationManHour$,
} from './workstation-manhour.form';

@Component({
  selector: 'workstation-manhour-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="workStationManHour"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class WorkStationManHourDetailComponent extends BaseComponent implements OnInit {
  override title = 'Workstation Man Hour';
  override subtitle = 'Workstation Man Hour Details';

  workStationManHour: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    workStationManHourUpsertBtn(this),
    workStationManHourDeleteBtn(this),
  ];

  private workStationManHourUid = this.route.snapshot?.paramMap?.get('workStationManHourUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WORKSTATION_MANHOUR_BY_UID,
    successFn: (res) => {
      const station = res?.data?.station?.name ?? '';
      const category = res?.data?.category?.name ?? '';
      this.title = station && category ? `${category} @ ${station}` : this.title;
    },
    variables: { uid: this.workStationManHourUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(workStationManHour$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.workStationManHour = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.workStationManHour);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: view,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
