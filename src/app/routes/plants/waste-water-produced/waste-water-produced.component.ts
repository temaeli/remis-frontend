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
  GET_WASTE_WATER_PRODUCED_BY_UID,
  GET_WASTE_WATER_PRODUCED_ITEMS,
} from './waste-water-produced.graphql';
import { wasteWaterProduced$, wasteWaterProducedProcessBtn } from './waste-water-produced.form';
import { WasteWaterProduced } from './waste-water-produced.interface';

@Component({
  selector: 'app-waste-water-produced',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="wasteWaterProduced"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class WasteWaterProducedComponent extends BaseComponent implements OnInit {
  override title = 'Waste Water Produced';
  override subtitle = 'Waste Water Produced Management';
  goBack$ = processReport$;

  wasteWaterProduced: WasteWaterProduced | undefined;
  wasteWaterProducedUid: string = this.route.snapshot?.paramMap?.get('wasteWaterProducedUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WASTE_WATER_PRODUCED_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.wasteWaterProducedUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(wasteWaterProduced$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [wasteWaterProducedProcessBtn(this)];
  }

  async setContents() {
    this.wasteWaterProduced = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.wasteWaterProduced,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'previousDay', 'today'],
            canExportData: true,
            reloadActions$: [wasteWaterProduced$],
            fetchParameter: {
              query: GET_WASTE_WATER_PRODUCED_ITEMS,
              variables: { reportUid: this.wasteWaterProducedUid },
            },
          },
        ],
      },
    ]);
  }
}
