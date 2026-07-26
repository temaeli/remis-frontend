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
  GET_POTABLE_WATER_ANALYSIS_BY_UID,
  GET_POTABLE_WATER_ANALYSIS_ITEMS,
} from './potable-water-analysis.graphql';
import {
  potableWaterAnalysis$,
  potableWaterAnalysisProcessBtn,
} from './potable-water-analysis.form';
import { PotableWaterAnalysis } from './potable-water-analysis.interface';

@Component({
  selector: 'app-potable-water-analysis',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="potableWaterAnalysis"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PotableWaterAnalysisComponent extends BaseComponent implements OnInit {
  override title = 'Potable Water Analysis';
  override subtitle = 'Potable Water Analysis Management';
  goBack$ = processReport$;

  potableWaterAnalysis: PotableWaterAnalysis | undefined;
  potableWaterAnalysisUid: string = this.route.snapshot?.paramMap?.get('potableWaterAnalysisUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_POTABLE_WATER_ANALYSIS_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.potableWaterAnalysisUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(potableWaterAnalysis$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [potableWaterAnalysisProcessBtn(this)];
  }

  async setContents() {
    this.potableWaterAnalysis = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.potableWaterAnalysis,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'specification', 'testedResult'],
            canExportData: true,
            reloadActions$: [potableWaterAnalysis$],
            fetchParameter: {
              query: GET_POTABLE_WATER_ANALYSIS_ITEMS,
              variables: { formUid: this.potableWaterAnalysisUid },
            },
          },
        ],
      },
    ]);
  }
}
