import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';
import {
  GET_POTABLE_WATER_PRODUCTION_BY_UID,
  GET_POTABLE_WATER_PRODUCTION_ITEMS,
} from './potable-water-production.graphql';
import {
  potableWaterProduction$,
  potableWaterProductionProcessBtn,
} from './potable-water-production.form';
import { PotableWaterProduction } from './potable-water-production.interface';

@Component({
  selector: 'app-potable-water-production',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="potableWaterProduction"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PotableWaterProductionComponent extends BaseComponent implements OnInit {
  override title = 'Potable Water Production';
  override subtitle = 'Potable Water Production Management';
  goBack$ = processReport$;

  potableWaterProduction: PotableWaterProduction | undefined;
  potableWaterProductionUid: string = this.route.snapshot?.paramMap?.get('potableWaterProductionUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_POTABLE_WATER_PRODUCTION_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.potableWaterProductionUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(potableWaterProduction$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [potableWaterProductionProcessBtn(this)];
  }

  async setContents() {
    this.potableWaterProduction = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.potableWaterProduction,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'previousDay', 'today'],
            canExportData: true,
            reloadActions$: [potableWaterProduction$],
            fetchParameter: {
              query: GET_POTABLE_WATER_PRODUCTION_ITEMS,
              variables: { reportUid: this.potableWaterProductionUid },
            },
          },
        ],
      },
    ]);
  }
}
