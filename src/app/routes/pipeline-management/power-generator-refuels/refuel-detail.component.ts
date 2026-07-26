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
import { GET_EQUIPMENT_REFUEL_BY_UID } from './refuel.graphql';
import {
  refuelUpsertBtn,
  refuelSubmitBtn,
  refuelApproveBtn,
  refuelRejectBtn,
  refuelDeleteBtn,
  powerGeneratorRefuel$,
} from './refuel.form';

@Component({
  selector: 'refuel-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="refuel"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class RefuelDetailComponent extends BaseComponent implements OnInit {
  override title = 'Standby Generator Refuel';
  override subtitle = 'Refuel Details';

  refuel: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    refuelUpsertBtn(this),
    refuelSubmitBtn(this),
    refuelApproveBtn(this),
    refuelRejectBtn(this),
    refuelDeleteBtn(this),
  ];

  private refuelUid = this.route.snapshot?.paramMap?.get('powerGeneratorRefuelUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_EQUIPMENT_REFUEL_BY_UID,
    successFn: (res) => {
      const generatorName = res?.data?.powerGenerator?.name;
      if (generatorName) this.title = `Refuel — ${generatorName}`;
    },
    variables: { uid: this.refuelUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(powerGeneratorRefuel$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.refuel = await this.fs.fetch(this.fetchParameter);
    const viewRefuel = formatEntityDates(this.refuel);
    const fullName = (u: any) =>
      u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || undefined
        : undefined;
    const generator = viewRefuel?.powerGenerator;
    const enrichedRefuel = {
      ...(viewRefuel ?? {}),
      generatorLabel: generator
        ? [generator.code, generator.name].filter(Boolean).join(' — ')
        : undefined,
      tankName: viewRefuel?.generatorTank?.name,
      approvedByName: fullName(viewRefuel?.approvedBy),
      rejectedByName: fullName(viewRefuel?.rejectedBy),
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
            { key: 'generatorLabel', label: 'Standby Generator' },
            { key: 'tankName', label: 'Main Tank' },
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
