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
import { GET_GENERATOR_TANK_REFUEL_BY_UID } from './tank-refuel.graphql';
import {
  tankRefuelUpsertBtn,
  tankRefuelDeleteBtn,
  tankRefuelSubmitBtn,
  tankRefuelApproveBtn,
  tankRefuelRejectBtn,
  generatorTankRefuel$,
} from './tank-refuel.form';

@Component({
  selector: 'tank-refuel-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="tankRefuel"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class TankRefuelDetailComponent extends BaseComponent implements OnInit {
  override title = 'Generator Main Tank Refuel';
  override subtitle = 'Generator Main Tank Refuel Details';

  tankRefuel: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    tankRefuelUpsertBtn(this),
    tankRefuelSubmitBtn(this),
    tankRefuelApproveBtn(this),
    tankRefuelRejectBtn(this),
    tankRefuelDeleteBtn(this),
  ];

  private tankRefuelUid = this.route.snapshot?.paramMap?.get('generatorTankRefuelUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_GENERATOR_TANK_REFUEL_BY_UID,
    variables: { uid: this.tankRefuelUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(generatorTankRefuel$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.tankRefuel = await this.fs.fetch(this.fetchParameter);
    const viewTankRefuel = formatEntityDates(this.tankRefuel);
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const tank = viewTankRefuel?.generatorTank;
    const enrichedRefuel = {
      ...(viewTankRefuel ?? {}),
      tankName: tank?.name,
      workingStationLabel: tank?.workingStation
        ? [tank.workingStation.code, tank.workingStation.name].filter(Boolean).join(' — ')
        : undefined,
      approvedByName: fullName(viewTankRefuel?.approvedBy),
      rejectedByName: fullName(viewTankRefuel?.rejectedBy),
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
          entity: enrichedRefuel,
          identity: [{ key: 'date', label: 'Refuel Date' }],
          context: [
            { key: 'tankName', label: 'Main Tank' },
            { key: 'workingStationLabel', label: 'Working Station' },
          ],
          specifications: [
            { key: 'quantityInLitres', label: 'Quantity (L)' },
            { key: 'newVolume', label: 'New Volume (L)' },
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
