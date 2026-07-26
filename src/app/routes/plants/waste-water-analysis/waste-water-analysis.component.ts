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
  GET_WASTE_WATER_ANALYSIS_BY_UID,
  GET_WASTE_WATER_ANALYSIS_ITEMS,
} from './waste-water-analysis.graphql';
import { wasteWaterAnalysis$, wasteWaterAnalysisProcessBtn } from './waste-water-analysis.form';
import { WasteWaterAnalysis } from './waste-water-analysis.interface';

@Component({
  selector: 'app-waste-water-analysis',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="wasteWaterAnalysis"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class WasteWaterAnalysisComponent extends BaseComponent implements OnInit {
  override title = 'Waste Water Analysis';
  override subtitle = 'Waste Water Analysis Management';
  goBack$ = processReport$;

  wasteWaterAnalysis: WasteWaterAnalysis | undefined;
  wasteWaterAnalysisUid: string = this.route.snapshot?.paramMap?.get('wasteWaterAnalysisUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_WASTE_WATER_ANALYSIS_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.wasteWaterAnalysisUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(wasteWaterAnalysis$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [wasteWaterAnalysisProcessBtn(this)];
  }

  async setContents() {
    this.wasteWaterAnalysis = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.wasteWaterAnalysis,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'testedResult'],
            canExportData: true,
            reloadActions$: [wasteWaterAnalysis$],
            fetchParameter: {
              query: GET_WASTE_WATER_ANALYSIS_ITEMS,
              variables: { reportUid: this.wasteWaterAnalysisUid },
            },
          },
        ],
      },
    ]);
  }
}
