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
  GET_WATER_TANK_LEVEL_BY_UID,
  GET_WATER_TANK_LEVEL_ITEMS,
} from './water-tank-level.graphql';
import { waterTankLevel$, waterTankLevelProcessBtn } from './water-tank-level.form';
import { WaterTankLevel } from './water-tank-level.interface';

@Component({
  selector: 'app-water-tank-level',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="waterTankLevel"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class WaterTankLevelComponent extends BaseComponent implements OnInit {
  override title = 'Water Tank Level';
  override subtitle = 'Water Tank Level Management';
  goBack$ = processReport$;

  waterTankLevel: WaterTankLevel | undefined;
  waterTankLevelUid: string = this.route.snapshot?.paramMap?.get('waterTankLevelUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WATER_TANK_LEVEL_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.waterTankLevelUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(waterTankLevel$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [waterTankLevelProcessBtn(this)];
  }

  async setContents() {
    this.waterTankLevel = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.waterTankLevel,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'measure'],
            canExportData: true,
            reloadActions$: [waterTankLevel$],
            fetchParameter: {
              query: GET_WATER_TANK_LEVEL_ITEMS,
              variables: { formUid: this.waterTankLevelUid },
            },
          },
        ],
      },
    ]);
  }
}
